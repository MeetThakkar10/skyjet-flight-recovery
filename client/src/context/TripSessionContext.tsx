import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

interface TripSessionValue {
  bookingId: string | null;
  passengerName: string | null;
  setBookingId: (id: string) => void;
  setPassengerName: (name: string) => void;
  clear: () => void;
}

const TripSessionContext = createContext<TripSessionValue | null>(null);

const STORAGE_KEY = "skyjet.bookingId";
const PASSENGER_NAME_KEY = "skyjet.passengerName";

export function TripSessionProvider({ children }: { children: ReactNode }) {
  const [bookingId, setBookingIdState] = useState<string | null>(() =>
    sessionStorage.getItem(STORAGE_KEY)
  );
  const [passengerName, setPassengerNameState] = useState<string | null>(() =>
    sessionStorage.getItem(PASSENGER_NAME_KEY)
  );

  const setBookingId = useCallback((id: string) => {
    sessionStorage.setItem(STORAGE_KEY, id);
    setBookingIdState(id);
  }, []);

  const setPassengerName = useCallback((name: string) => {
    sessionStorage.setItem(PASSENGER_NAME_KEY, name);
    setPassengerNameState(name);
  }, []);

  const clear = useCallback(() => {
    sessionStorage.removeItem(STORAGE_KEY);
    sessionStorage.removeItem(PASSENGER_NAME_KEY);
    setBookingIdState(null);
    setPassengerNameState(null);
  }, []);

  return (
    <TripSessionContext.Provider value={{ bookingId, passengerName, setBookingId, setPassengerName, clear }}>
      {children}
    </TripSessionContext.Provider>
  );
}

export function useTripSession() {
  const ctx = useContext(TripSessionContext);
  if (!ctx) throw new Error("useTripSession must be used within a TripSessionProvider");
  return ctx;
}
