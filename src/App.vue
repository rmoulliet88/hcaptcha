<script setup lang="ts">
import { ref } from 'vue'
import { useHCaptcha } from './composables/useHCaptcha.client';

const sitekey = '10000000-ffff-ffff-ffff-000000000001'; // test sitekey

const { root, token, error, size, reset, waitForToken, switchToVisible, switchToInvisible } = useHCaptcha(sitekey, 'invisible');
const alert = window.alert;

const tabs = ref(["Info", "Demo"]);
const activeTab = ref("Info");
</script>

<template>
  <div class="flex flex-col gap-4 mb-4">
    <div class="text-2xl font-bold text-center">HCaptcha</div>
    <div class="tabs">
      <div class="flex gap-4 border-b pb-2">
        <button v-for="tab in tabs" :key="tab" class="px-3 py-2"
          :class="activeTab === tab ? 'border-b-2 border-blue-500 font-semibold' : ''" @click="activeTab = tab">
          {{ tab }}
        </button>
      </div>
    </div>
    <div v-if="activeTab === 'Info'" class="flex flex-col gap-6">
      <div>
        Invisible mode would want to be your default and if an error is returned, may mean that the user has a higher
        risk score, so you would then want to switch to visible. One thing to note with invisible mode is that it may be
        blocked by ad blockers, so you may want to have a fallback in place and switch to visible mode if the captcha
        fails to load.
      </div>
      <div class="italic">
        Note: Invisible mode requires a call behind the scenes to get the token, hence the waitForToken function. This
        is not instant, but it can be called when the user submits a form or clicks a button. You don't want to call it
        too early, as the token will expire after 2 minutes.
      </div>
      <div>
        Visible mode is more intrusive to the user, but may be necessary for high risk actions, such as submitting a
        form or making a payment. The biggest thing is, at least it isn't a complicated challenge that frustrates users.
        It is a simple checkbox that is easy to understand and complete.
      </div>
      <div class="flex flex-col gap-2">
        <h1>
          Below is the function you would want to validate the token that the client side received. Verification cannot
          be done in the browser. If you wish to test verification, you'll need the testing sitekey and secret.
        </h1>
        <pre>
          const sitekey = '10000000-ffff-ffff-ffff-000000000001'
          const secret = '0x0000000000000000000000000000000000000000'

          const verifyToken = () => {
            const params = new URLSearchParams()
            params.set('secret', secretTest)
            params.set('response', token.value as string)
            params.set('sitekey', sitekey);

            return fetch('https://hcaptcha.com/siteverify', {
              method: 'POST',
              body: params
            }).then(res => res.json())
              .then((data: VerifyResponse) => {
                if (data.success) {
                  alert('Token verified successfully!');
                } else {
                  alert('Token verification failed: ' + (data['error-codes'] || []).join(', '));
                }
              })
              .catch(err => {
                alert('Error verifying token: ' + err.message);
              });
          };
        </pre>
      </div>
    </div>
    <div v-if="activeTab === 'Demo'" class="flex flex-col gap-4">
      <div class="text-xl">Current mode: {{ size }}</div>
      <div class="flex flex-row gap-4">
        <button v-if="size === 'invisible'" @click="switchToVisible">Switch to visible</button>
        <button v-else @click="switchToInvisible">Switch to invisible</button>
        <button v-if="size === 'invisible'" @click="waitForToken().then(t => alert(t)).catch(e => alert(e))">Fetch token</button>
        <button @click="reset">Reset</button>
      </div>
      <div>Token: {{ token }}</div>
      <div>Error: {{ error }}</div>
    </div>
    <div ref="root"></div>
  </div>
</template>

<style scoped>
@reference "./assets/css/main.css";

button {
  @apply bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded;
}
</style>