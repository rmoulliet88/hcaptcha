import { onMounted, onBeforeUnmount, ref, type Ref } from 'vue'

// ---- Types
interface HCaptchaRenderOptions {
    sitekey: string
    size?: 'invisible' | 'normal' | 'compact'
    callback?: (token: string) => void
    'expired-callback'?: () => void
    'error-callback'?: (err: unknown) => void
}

interface HCaptchaGlobal {
    render: (el: HTMLElement, opts: HCaptchaRenderOptions) => number
    execute: (id: number) => void
    reset: (id: number) => void
    remove: (id: number) => void
}

declare global {
    interface Window {
        hcaptcha?: HCaptchaGlobal
        hcaptchaOnLoad?: () => void
    }
}

// ---- Singleton loader (shared across all composable callers)
let apiReadyPromise: Promise<void> | null = null

function ensureScript(): Promise<void> {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
        return Promise.resolve()
    }
    if (window.hcaptcha) return Promise.resolve()
    if (apiReadyPromise) return apiReadyPromise

    apiReadyPromise = new Promise<void>((resolve, reject) => {
        const existing = document.querySelector<HTMLScriptElement>('script[src*="hcaptcha.com/1/api.js"]')
        if (!existing) {
            const script = document.createElement('script')
            script.src = 'https://hcaptcha.com/1/api.js?render=explicit&onload=hcaptchaOnLoad'
            script.async = true
            script.defer = true
            script.onerror = () => reject(new Error('Failed to load hCaptcha script'))
            document.head.appendChild(script)
        }
        if (!window.hcaptchaOnLoad) {
            window.hcaptchaOnLoad = () => resolve()
        }
    })
    return apiReadyPromise
}

export type UseHCaptchaMode = 'invisible' | 'normal'

export function useHCaptcha(sitekey: string, mode: UseHCaptchaMode = 'invisible') {
    const root: Ref<HTMLElement | null> = ref(null)
    const widgetId = ref<number | null>(null)
    const currentSize = ref<UseHCaptchaMode>(mode)
    const token: Ref<string | null> = ref(null)
    const error: Ref<string | null> = ref(null)
    const verifying = ref(false)

    // Pending promise state for waitForToken
    let pendingResolveToken: ((t: string) => void) | null = null
    let pendingTimer: ReturnType<typeof setTimeout> | null = null

    function renderWidget() {
        if (!root.value || !window.hcaptcha) return
        widgetId.value = window.hcaptcha.render(root.value, {
            sitekey,
            size: currentSize.value,
            callback: (t: string) => {
                token.value = t
                if (pendingResolveToken) {
                    pendingResolveToken(t)
                    pendingResolveToken = null
                }
            },
            'expired-callback': () => {
                token.value = null
                if (pendingResolveToken) {
                    if (pendingTimer) clearTimeout(pendingTimer)
                    pendingTimer = null
                    pendingResolveToken = null
                }
            },
            'error-callback': (e: unknown) => {
                error.value = e instanceof Error ? e.message : 'Verification error'
                if (pendingResolveToken) {
                    if (pendingTimer) clearTimeout(pendingTimer)
                    pendingTimer = null
                    pendingResolveToken = null
                }
            }
        })
    }

    function execute() {
        if (widgetId.value !== null && currentSize.value === 'invisible') {
            window.hcaptcha?.execute(widgetId.value)
        }
    }

    function reset() {
        if (widgetId.value !== null) window.hcaptcha?.reset(widgetId.value)
        token.value = null
    }

    function remove() {
        if (widgetId.value !== null) window.hcaptcha?.remove(widgetId.value)
        widgetId.value = null
    }

    function forceVerify() { reset(); execute() }

    function switchToVisible() {
        if (!window.hcaptcha || widgetId.value === null) return
        reset()
        window.hcaptcha.remove(widgetId.value)
        widgetId.value = null
        currentSize.value = 'normal'
        renderWidget()
    }

    function switchToInvisible() {
        if (!window.hcaptcha || widgetId.value === null) return
        reset()
        window.hcaptcha.remove(widgetId.value)
        widgetId.value = null
        currentSize.value = 'invisible'
        renderWidget()
    }


    function waitForToken(timeoutMs: number = 120000): Promise<string> {
        if (pendingResolveToken) {
            return Promise.reject(new Error('Verification already in progress'))
        }
        return new Promise<string>((resolve, reject) => {
            if (widgetId.value === null) {
                reject(new Error('hCaptcha not ready'))
                return
            }
            pendingResolveToken = (t: string) => {
                if (pendingTimer) clearTimeout(pendingTimer)
                pendingTimer = null
                verifying.value = false
                resolve(t)
            }
            verifying.value = true
            if (currentSize.value === 'invisible') execute()
            pendingTimer = setTimeout(() => {
                pendingResolveToken = null
                verifying.value = false
                reject(new Error('Timed out waiting for hCaptcha token'))
            }, timeoutMs)
        })
    }

    onMounted(async () => {
        try {
            await ensureScript()
            renderWidget()
        } catch (e) {
            error.value = e instanceof Error ? e.message : 'Failed to load hCaptcha'
        }
    })

    onBeforeUnmount(() => {
        if (pendingTimer) clearTimeout(pendingTimer)
        remove()
    })

    return {
        // mount point
        root,
        // state
        token, error, verifying, size: currentSize,
        // actions
        execute, reset, forceVerify, waitForToken, switchToVisible, switchToInvisible
    }
}