import type { Dispatch, SetStateAction } from 'react';
import { useCallback, useEffect, useState, useRef } from 'react';
import localforage from 'localforage';

export function useLocalForage<T>(
  key: string,
  initialValue: T
): [T, Dispatch<SetStateAction<T>>, boolean] {
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  const [loading, setLoading] = useState(true);

  // Use a ref to access the latest initialValue inside useEffect without adding it to dependencies.
  const initialValueRef = useRef(initialValue);

  // Update ref if initialValue changes
  useEffect(() => {
    initialValueRef.current = initialValue;
  }, [initialValue]);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    localforage
      .getItem<T>(key)
      .then((value) => {
        if (!isMounted) return;

        if (value !== null) {
          // Check if it's a plain object for merging
          const initVal = initialValueRef.current;
          const isInitObject = Object.prototype.toString.call(initVal) === '[object Object]';
          const isValueObject = Object.prototype.toString.call(value) === '[object Object]';

          if (isInitObject && isValueObject) {
            setStoredValue({
              ...(initVal as object),
              ...(value as object),
            } as T);
          } else {
            setStoredValue(value);
          }
        } else {
          // If nothing is stored, use the initial value
          setStoredValue(initialValueRef.current);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error(`Error reading from localForage key "${key}":`, err);
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [key]);

  const setValue: Dispatch<SetStateAction<T>> = useCallback(
    (value) => {
      setStoredValue((prevStoredValue) => {
        const valueToStore =
          value instanceof Function ? value(prevStoredValue) : value;

        localforage.setItem(key, valueToStore).catch((err) => {
          console.error(`Error writing to localForage key "${key}":`, err);
        });

        return valueToStore;
      });
    },
    [key]
  );

  return [storedValue, setValue, loading];
}
