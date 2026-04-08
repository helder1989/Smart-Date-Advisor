function getDateOffset(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

export function getFlightDefaults() {
  return {
    origin: 'GRU',
    originCity: 'São Paulo',
    destination: 'BSB',
    destinationCity: 'Brasília',
    tripType: 'roundTrip' as const,
    departureDate: getDateOffset(7),
    returnDate: getDateOffset(11),
    travelers: 1,
    flexibility: { departureDays: 3, returnDays: 2 },
  };
}

export function getHotelDefaults() {
  return {
    destination: 'São Paulo, SP',
    checkIn: getDateOffset(7),
    checkOut: getDateOffset(10),
    guests: 1,
    rooms: 1,
    flexibility: { departureDays: 3, returnDays: 2 },
  };
}

export function getCarDefaults() {
  return {
    pickupLocation: 'São Paulo, SP',
    pickupDate: getDateOffset(7),
    pickupTime: '10:00',
    dropoffDate: getDateOffset(10),
    dropoffTime: '10:00',
    flexibility: { departureDays: 3, returnDays: 2 },
  };
}

export function getBusDefaults() {
  return {
    origin: 'São Paulo, SP',
    destination: 'Brasília, DF',
    tripType: 'roundTrip' as const,
    departureDate: getDateOffset(5),
    returnDate: getDateOffset(8),
    passengers: 1,
    flexibility: { departureDays: 3, returnDays: 2 },
  };
}
