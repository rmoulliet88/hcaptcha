# hCaptcha Vue Composable

This project demonstrates integrating [hCaptcha](https://www.hcaptcha.com/) into a Vue application using a composable.  
It provides a lightweight solution to help protect forms and user actions from automated bots without relying on Google reCaptcha.

## Why not reCaptcha?

Google reCaptcha often frustrates users with puzzles and is not well-known for respecting privacy.  
While it does offer an "invisible" mode, alternatives such as [Friendly Captcha](https://friendlycaptcha.com/), [mCaptcha](https://mcaptcha.org/), and [hCaptcha](https://www.hcaptcha.com/) place greater emphasis on:

- User privacy  
- Accessibility  
- Compliance with privacy laws such as GDPR  

hCaptcha also provides a free tier (comparable to reCaptcha’s free limit of 10,000 assessments).

## Vue Composable Approach

This repo implements hCaptcha as a **Vue composable**, making it reusable across different parts of an application.  
Composables are ideal for sharing stateful logic within Vue components. If you need global state management across multiple pages, consider using the [Pinia store](https://pinia.vuejs.org/).

### Example Use Cases

- Contact forms  
- User signups  
- Payment forms (helping prevent credit card fraud)  

## Live Demo & Repository

- **Demo:** [https://rmoulliet88.github.io/hcaptcha/](https://rmoulliet88.github.io/hcaptcha/)  
- **Source Code:** [https://github.com/rmoulliet88/hcaptcha](https://github.com/rmoulliet88/hcaptcha)  

## Contributing

Issues and pull requests are welcome.  
If you find a bug or have a suggestion, feel free to open an issue.  

## License

MIT