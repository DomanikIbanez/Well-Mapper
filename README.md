# Well Mapper

A responsive frontend mapping app built with **React**, **Redux Toolkit**, **Mapbox GL JS**, **TypeScript**, and **Material UI**.

## 📌 Features

- Select a well from a dropdown menu
- View the well's location on an interactive Mapbox map
- See detailed well information in a clean info panel
- Responsive layout using Material UI Grid and Card components
- Redux-managed global state with TypeScript interfaces
- Modular project structure for scalability and maintainability

## 🧠 Tech Stack

- React + TypeScript
- Redux Toolkit (State management)
- Mapbox GL JS (Interactive maps)
- Material UI (UI styling and layout)
- Create React App

## 📁 Folder Structure (Simplified)

```
src/
├── app/               # Redux store
├── components/        # React UI components
├── data/              # Mock well data
├── features/          # Redux slice for selected well
├── types/             # Shared TypeScript interfaces
└── App.tsx            # Layout + component composition
```

## 🚀 Getting Started

### 1. Clone the Repo

```bash
git clone https://github.com/DomanikIbanez/well-mapper.git
cd well-mapper
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Add `.env`

Create a `.env` file in the root of the project:

```env
REACT_APP_MAPBOX_TOKEN=your_mapbox_token_here
```

> 🔐 Do NOT commit your `.env` file.

### 4. Start the App

```bash
npm start
```

## 🔗 Live Demo

_(Coming Soon – hosted on Vercel or GitHub Pages)_

## 📬 Contact

Built by **Domanik Ibanez**  
Backend-leaning full stack dev exploring frontend mapping tools  
[GitHub Profile](https://github.com/DomanikIbanez)