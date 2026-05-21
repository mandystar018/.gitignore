# 🌱 Montessori Activities

A React Native app that helps parents and caregivers discover Montessori-inspired activities for children from birth to 6 years old.

## Features

- **Quiz-based discovery** — answer 4 quick questions (age, duration, location, materials) to get matched activities
- **8 focus areas** — Practical Life, Sensorial, Language, Mathematics, Art, Science, Music & Movement, Outdoor
- **Activity details** — step-by-step instructions, materials list, skills developed, and Montessori principle behind each activity
- **Filter & sort** — browse all activities and filter by category
- **Photo memories** — capture and save photos from activity moments
- **Offline-first** — all activity data is bundled in the app, no internet required

## Age Ranges

- 0–6 months
- 6–12 months
- 12–18 months
- 18–24 months
- 2–3 years
- 3–6 years

## Tech Stack

- [Expo](https://expo.dev) ~54
- React Native 0.81
- TypeScript
- React Navigation (Stack)
- Expo Image Picker
- AsyncStorage

## Getting Started

```bash
# Install dependencies
npm install

# Start the development server
npm start

# Run on iOS
npm run ios

# Run on Android
npm run android
```

## Project Structure

```
src/
  components/     # Reusable UI components
  data/           # Activity data (40+ hand-crafted activities)
  navigation/     # Stack navigator
  screens/        # Welcome, Quiz, Activities, ActivityDetail
  theme/          # Colors, spacing, typography
  types/          # TypeScript interfaces
  utils/          # Activity filtering, photo storage
```

## Inspiration

Based on *The Montessori Toddler* by Simone Davies.

> "The child who has never learned to act alone, to direct his own actions..." — Maria Montessori
