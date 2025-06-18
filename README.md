# WCO Biodiesel LCA Calculator

[![CI/CD Workflow Status](https://github.com/istiyakamin/bifuel-lca-calculator/actions/workflows/main.yml/badge.svg)](https://github.com/istiyakamin/bifuel-lca-calculator/actions/workflows/main.yml)
[![GitHub Pages Deployment Status](https://img.shields.io/github/deployments/istiyakamin/bifuel-lca-calculator/github-pages?label=pages%20deploy&logo=github)](https://istiyakamin.github.io/bifuel-lca-calculator/)
[![License](https://img.shields.io/github/license/istiyakamin/bifuel-lca-calculator)](https://github.com/istiyakamin/bifuel-lca-calculator/blob/main/LICENSE)

An interactive web application to perform a Life Cycle Assessment (LCA) for biodiesel produced from Waste Cooking Oil (WCO). This tool allows users to input data for various life cycle stages, calculate environmental impacts across multiple categories (e.g., Global Warming Potential, Acidification, Eutrophication), compare results with conventional fossil diesel, and visualize these findings through various charts and summaries.

**Note on Badges:** Badges like "Total Downloads" or "Latest Stable Version" are typically for libraries published on package registries (e.g., npm). As this is a web application deployed as a static site, those specific badges are not directly applicable. The "Build Status" and "Deployment Status" reflect the current state of the `main` branch.

## ✨ Features

*   **Interactive Input Forms:** Detailed inputs for each life cycle stage:
    *   Feedstock Collection (WCO source, transport, quantity, FFA content)
    *   WCO Transportation to Plant
    *   Biodiesel Production (methanol usage, catalyst, yield, energy sources)
    *   Biodiesel Distribution
    *   Use Phase (marine engine combustion)
*   **Comprehensive Impact Assessment:** Calculates impacts for:
    *   Global Warming Potential (GWP)
    *   Acidification Potential
    *   Eutrophication Potential
    *   Human Toxicity
    *   Particulate Matter Formation
    *   Land Use
    *   Water Use
*   **Functional Unit Selection:** Results can be normalized per MJ of energy delivered or per Liter of biodiesel.
*   **Dynamic Results Dashboard:**
    *   KPI Summary Cards for key metrics.
    *   Detailed "Impact Comparison" tables (per functional unit and for total batch volume).
    *   "Biodiesel Blend GWP Comparison" table.
    *   Hotspot analysis identifying major contributing stages.
    *   Illustrative comparison with fossil diesel, including stage contributions.
*   **Rich Visualizations:**
    *   Bar charts comparing biodiesel vs. fossil diesel impacts.
    *   Stacked bar charts showing impact contributions by stage.
    *   Pie chart for GWP hotspot contributions.
    *   Radar chart for multi-category relative performance.
    *   Heatmap table for impact intensity across categories and stages.
*   **Data Export:**
    *   Download results summary in JSON format.
    *   Generate a dynamic PDF report of the results dashboard.
*   **Transparent Methodology:** Includes sections for input summary, key findings, and detailed methodology & assumptions.

## 🚀 Getting Started

This project is a client-side web application built with React (using ES Modules and `htm/react`), TypeScript, and Tailwind CSS. It runs directly in the browser without a backend server or complex build process for the core functionality.

**Prerequisites:**
*   A modern web browser that supports ES Modules and `importmap`.

**Running Locally:**
1.  Clone this repository:
    ```bash
    git clone https://github.com/istiyakamin/bifuel-lca-calculator.git
    cd bifuel-lca-calculator
    ```
    (Replace `istiyakamin/bifuel-lca-calculator` with your fork's URL if applicable)
2.  Open the `index.html` file in your web browser.
    *   You can do this by double-clicking the file or by using a simple local web server (e.g., Live Server extension in VS Code, or `python -m http.server` in the project directory). Using a local server is recommended to avoid potential issues with file path resolutions in some browsers.

**API Key for Gemini API (Not Used in Current Open Source Version)**
*   The original project structure includes guidelines for using the Gemini API via `process.env.API_KEY`. **This open-source version does not directly implement or require calls to the Gemini API.** If you intend to integrate Gemini API features in a fork or future version, ensure the API key is managed securely and is **never** committed to the repository. The application is designed to function as an LCA calculator without external API calls.

## 🛠️ Project Structure

*   `index.html`: Main HTML file, includes `importmap` for dependencies.
*   `index.tsx`: Main entry point for the React application.
*   `App.tsx`: Root React component, manages state and navigation.
*   `metadata.json`: Basic application metadata.
*   `types.ts`: TypeScript type definitions and enums.
*   `constants.ts`: Default values, emission factors (illustrative), and other constants.
*   `services/`:
    *   `lcaCalculator.ts`: Core logic for LCA calculations.
*   `components/`: Contains all React UI components for forms, charts, and results display.
*   `tsconfig.json`: TypeScript compiler configuration.
*   `.github/workflows/main.yml`: GitHub Actions workflow for CI/CD.

## 🚢 Deployment to GitHub Pages

This project includes a GitHub Actions workflow (`.github/workflows/main.yml`) that automatically type-checks your code and deploys the application to GitHub Pages when changes are pushed to the `main` branch.

To enable GitHub Pages for your repository:
1.  Navigate to your repository on GitHub.
2.  Go to **Settings** > **Pages**.
3.  Under "Build and deployment", for the **Source**, select **GitHub Actions**.
4.  After the first successful workflow run that includes a deployment, your site will be available at `https://YOUR_USERNAME.github.io/YOUR_REPOSITORY_NAME/` (e.g., `https://istiyakamin.github.io/bifuel-lca-calculator/`).

## 📊 Illustrative Data

The emission factors and other LCA data used in this calculator (found in `constants.ts`) are **illustrative placeholders**. For accurate and publishable LCA studies, these values **must** be replaced with specific, verified data from scientific literature, commercial LCA databases (e.g., Ecoinvent, GaBi), or primary data collection.

## 🤝 Contributing

Contributions are welcome! If you'd like to contribute, please:
1.  Fork the repository.
2.  Create a new branch for your feature or bug fix (`git checkout -b feature/your-feature-name`).
3.  Make your changes.
4.  Commit your changes (`git commit -am 'Add some feature'`).
5.  Push to the branch (`git push origin feature/your-feature-name`).
6.  Create a new Pull Request.

Please see `CONTRIBUTING.md` for more detailed guidelines.

## 📜 License

This project is licensed under the **Apache License 2.0**. See the `LICENSE` file for details.

## ⚠️ Disclaimer

This LCA calculator is provided for illustrative and educational purposes only. The results generated are based on the input data provided by the user and the illustrative emission factors embedded in the tool. The creators and contributors are not responsible for any decisions made based on the results of this calculator. Always consult with LCA professionals and use verified data sources for critical assessments.