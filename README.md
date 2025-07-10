# 🌍 Well Mapper (Energy Map Explorer)

A responsive, interactive mapping app built with **React**, **Redux Toolkit**, **Mapbox GL JS**, **TypeScript**, and **Material UI**.

## 📌 Features

- ✅ Toggle visibility of **3 energy-related layers**:
  - Power Plants
  - Oil & Gas Fields
  - Substations
- ✅ Click on any map point to view a styled **popup with feature info**
- ✅ View **feature details** in a smart, filterable **data table**
- ✅ Click a row in the table to **zoom to and highlight** that feature on the map
- ✅ Layer control sidebar for better UX
- 🧠 Typed global state via Redux Toolkit + TypeScript
- 💅 Material UI styling throughout

## 🧠 Tech Stack

- React + TypeScript
- Redux Toolkit (state management)
- Mapbox GL JS (interactive maps)
- Material UI (component styling & layout)
- Material React Table (smart data tables)
- Create React App

## 🗂 Folder Structure (Simplified)

src/
├── app/ # Redux store config
├── components/ # Map, LayerList, FeatureTable, InfoPanel
├── data/ # GeoJSON datasets
├── features/ # Redux slices (layer visibility, well selection)
├── types/ # Shared TypeScript types/interfaces
└── App.tsx # Root layout + composition

## 🚀 Getting Started

### 1. Clone the Repo

git clone https://github.com/DomanikIbanez/well-mapper.git
cd well-mapper

### 2. Install Dependencies

npm install

### 3. Add `.env`

Create a `.env` file in the root of the project:

REACT_APP_MAPBOX_TOKEN=your_mapbox_token_here

> 🔐 Do NOT commit your `.env` file.

### 4. Start the App

npm start

or (if run into dependency issues)

npm start --legacy-peer-deps 

## 🔗 Live Demo

_(Coming Soon – hosted on Vercel or GitHub Pages)_

## 📬 Contact

Built by **Domanik Ibanez**  
Backend-leaning full stack dev exploring frontend mapping tools  
[GitHub Profile](https://github.com/DomanikIbanez)