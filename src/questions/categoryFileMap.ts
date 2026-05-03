// src/questions/categoryFileMap.ts
// IMPORTANT: Metro bundler requires static require() paths.

export type CategoryKey =
  | 'science'
  | 'history'
  | 'movies'
  | 'geography'
  | 'generalknowledge';

export const categoryFileMap: Record<CategoryKey, any> = {
  science: require('../../assets/data/questions/science.json'),
  history: require('../../assets/data/questions/history.json'),
  movies: require('../../assets/data/questions/movies.json'),
  geography: require('../../assets/data/questions/Geography.json'),
  generalknowledge: require('../../assets/data/questions/generalKnowledge.json'),
};

