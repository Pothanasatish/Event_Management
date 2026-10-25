import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { EventCard } from '../components/shared/EventCard';
import { AuthProvider } from '../context/AuthContext';

describe('EventCard Component', () => {
  const mockEvent = {
    _id: 'evt-12345',
    title: 'Silicon Valley AI Summit',
    description: 'Premier artificial intelligence and agentic systems conference.',
    coverImage: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800',
    startDate: new Date(Date.now() + 86400000).toISOString(),
    price: 199,
    capacity: 100,
    attendeesCount: 25,
    locationType: 'physical',
    venue: { name: 'Moscone Center', city: 'San Francisco' },
    category: { name: 'Technology' },
    organizer: { name: 'Sarah Chen' },
  };

  it('renders event title and venue correctly', () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <EventCard event={mockEvent} />
        </AuthProvider>
      </BrowserRouter>
    );

    expect(screen.getByText('Silicon Valley AI Summit')).toBeInTheDocument();
    expect(screen.getByText('Moscone Center')).toBeInTheDocument();
    expect(screen.getByText('$199')).toBeInTheDocument();
    expect(screen.getByText('Technology')).toBeInTheDocument();
  });

  it('displays spots left calculation', () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <EventCard event={mockEvent} />
        </AuthProvider>
      </BrowserRouter>
    );

    expect(screen.getByText('75 spots left')).toBeInTheDocument();
  });
});
