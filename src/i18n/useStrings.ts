import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import strings from './strings.json';

export function useStrings() {
  const [lang, setLang] = useState('en');
  const [labels, setLabels] = useState(strings.en);

  useEffect(() => {
    const loadLang = async () => {
      const stored = await AsyncStorage.getItem('language');
      const active = stored || 'en';
      setLang(active);
      setLabels(strings[active] || strings.en);
    };
    loadLang();
  }, []);

  return { t: labels, lang, setLang };
}