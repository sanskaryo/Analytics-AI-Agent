# Data Visualization Project

Welcome to the Data Visualization Project! This project allows you to upload datasets and generate insightful visualizations using natural language queries.

## Project Overview

This project is built to help users explore and visualize their datasets interactively. Users can upload CSV or Excel files, ask questions about their data, and receive visualizations and insights in response.

## Features

- **File Upload**: Upload CSV or Excel files to analyze.
- **Interactive Dashboard**: View suggested visualizations and interact with them.
- **Natural Language Queries**: Ask questions about your data and get visualizations in response.
- **Download Visualizations**: Download generated visualizations as images.

## Technologies Used

- **Vite**: Fast build tool for modern web projects.
- **TypeScript**: Typed superset of JavaScript.
- **React**: JavaScript library for building user interfaces.
- **shadcn-ui**: UI components built with Tailwind CSS.
- **Tailwind CSS**: Utility-first CSS framework.

## Getting Started

### Prerequisites

Ensure you have Node.js and npm installed. You can install Node.js using [nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

### Installation

1. **Clone the repository**:
    ```sh
    git clone <YOUR_GIT_URL>
    ```

2. **Navigate to the project directory**:
    ```sh
    cd <YOUR_PROJECT_NAME>
    ```

3. **Install dependencies**:
    ```sh
    npm install
    ```

4. **Start the development server**:
    ```sh
    npm run dev
    ```

### Usage

1. **Upload a Dataset**: Click on the "Upload" button and select a CSV or Excel file.
2. **View Visualizations**: The dashboard will display suggested visualizations based on your dataset.
3. **Ask Questions**: Use the chat interface to ask questions about your data. For example, "Show me the distribution of sales by region."
4. **Download Visualizations**: Click on the "Download" button to save visualizations as images.

## Project Structure

```
├── public
│   └── ...
├── src
│   ├── components
│   │   ├── ui
│   │   │   └── ...
│   │   ├── ChatInterface.tsx
│   │   ├── Dashboard.tsx
│   │   ├── DataVisualizer.tsx
│   │   └── ...
│   ├── hooks
│   │   └── useDataProcessing.ts
│   ├── lib
│   │   └── dataUtils.ts
│   ├── pages
│   │   └── Index.tsx
│   ├── services
│   │   ├── groqService.ts
│   │   └── llmService.ts
│   ├── App.tsx
│   ├── index.css
│   ├── main.tsx
│   └── ...
├── .gitignore
├── index.html
├── package.json
├── README.md
└── tailwind.config.ts
```

## Deployment

To deploy this project, you can use platforms like Netlify or Vercel. Follow their documentation for deployment steps.

## Contributing

Contributions are welcome! Please fork the repository and create a pull request with your changes.

## License

This project is licensed under the MIT License.

## Contact

For any questions or feedback, please contact [Keshav Agrawal](mailto:keshav@example.com).

---

Thank you for using the Data Visualization Project! We hope it helps you gain valuable insights from your data.