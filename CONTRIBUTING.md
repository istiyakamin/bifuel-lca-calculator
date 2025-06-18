
# Contributing to WCO Biodiesel LCA Calculator

Thank you for your interest in contributing to the WCO Biodiesel LCA Calculator! We welcome contributions from the community to help improve and expand this tool.

## How to Contribute

There are several ways you can contribute:

*   **Reporting Bugs:** If you find a bug, please open an issue in the GitHub repository. Include a clear description, steps to reproduce, and any relevant screenshots.
*   **Suggesting Enhancements:** If you have ideas for new features or improvements to existing ones, feel free to open an issue to discuss them.
*   **Code Contributions:** If you'd like to contribute code:
    1.  **Fork the Repository:** Create your own copy of the repository on GitHub.
    2.  **Clone your Fork:** `git clone https://github.com/YOUR_USERNAME/wco-biodiesel-lca-calculator.git`
    3.  **Create a Branch:** `git checkout -b feature/your-descriptive-feature-name` or `bugfix/issue-number-description`.
    4.  **Make your Changes:** Implement your feature or bug fix.
        *   Adhere to the existing code style and structure.
        *   Ensure your changes are well-commented, especially for complex logic.
        *   If adding new dependencies, discuss this in an issue first, as the project aims to maintain a minimal dependency footprint.
    5.  **Test your Changes:** Thoroughly test your changes to ensure they work as expected and do not introduce regressions.
    6.  **Commit your Changes:** Write clear and concise commit messages. E.g., `git commit -m "feat: Add new chart for XYZ analysis"` or `git commit -m "fix: Correct calculation error in GWP results"`.
    7.  **Push to your Branch:** `git push origin feature/your-descriptive-feature-name`.
    8.  **Open a Pull Request (PR):** Go to the original repository on GitHub and open a Pull Request from your forked branch to the `main` branch of the original repository.
        *   Provide a clear title and description for your PR.
        *   Link to any relevant issues.
        *   Be prepared to discuss your changes and make further modifications if requested by maintainers.

## Development Setup

This project uses React with TypeScript, running directly in the browser via ES Modules and `importmap` specified in `index.html`.

*   **No complex build step required for basic development.**
*   Simply open `index.html` in a modern browser (preferably using a local web server like VS Code's Live Server).
*   Code style is generally guided by Prettier (though not formally enforced via pre-commit hooks in this basic setup). Try to maintain consistency.

## Coding Guidelines

*   **TypeScript:** Use TypeScript for all `.ts` and `.tsx` files. Utilize types and interfaces to improve code clarity and maintainability.
*   **React:** Follow modern React best practices (e.g., functional components with hooks).
*   **Clarity and Readability:** Write clean, well-organized, and readable code. Add comments where necessary to explain complex logic.
*   **Illustrative Data:** If adding new emission factors or constants, clearly mark them as "illustrative" or "placeholder" if they are not from verified LCA databases.
*   **User Experience (UX):** Keep the user experience in mind. New features should be intuitive and user-friendly.
*   **Accessibility (A11y):** Strive to make UI components accessible (e.g., use ARIA attributes where appropriate, ensure keyboard navigability).

## Code of Conduct

Please note that this project is released with a Contributor Code of Conduct (`CODE_OF_CONDUCT.md`). By participating in this project, you agree to abide by its terms.

We look forward to your contributions!
