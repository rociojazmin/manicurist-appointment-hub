
import React, { createContext, useContext, useState } from "react";
import { Service as DatabaseService } from "@/types/database";

// Use the Service type from database.ts
type Service = DatabaseService;

type ClientInfo = {
  name: string;
  phone: string;
  notes?: string;
};

type BookingContextType = {
  selectedService: Service | null;
  selectedDate: Date | null;
  selectedTime: string | null;
  clientInfo: ClientInfo | null;
  setSelectedService: (service: Service | null) => void;
  setSelectedDate: (date: Date | null) => void;
  setSelectedTime: (time: string | null) => void;
  setClientInfo: (info: ClientInfo | null) => void;
  resetBooking: () => void;
};

// Create context
const BookingContext = createContext<BookingContextType | undefined>(undefined);

// Hook to use context
export const useBooking = () => {
  const context = useContext(BookingContext);
  if (context === undefined) {
    throw new Error("useBooking debe usarse dentro de un BookingProvider");
  }
  return context;
};

// Context provider
export const BookingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [clientInfo, setClientInfo] = useState<ClientInfo | null>(null);

  const resetBooking = () => {
    setSelectedService(null);
    setSelectedDate(null);
    setSelectedTime(null);
    setClientInfo(null);
  };

  const value = {
    selectedService,
    selectedDate,
    selectedTime,
    clientInfo,
    setSelectedService,
    setSelectedDate,
    setSelectedTime,
    setClientInfo,
    resetBooking,
  };

  return <BookingContext.Provider value={value}>{children}</BookingContext.Provider>;
};
