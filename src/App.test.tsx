import { render, screen } from '@testing-library/react';
import App from './App';

test('renders XState Builder Pattern Demo', () => {
  render(<App />);
  const titleElement = screen.getByText(/XState Builder Pattern Demo/i);
  expect(titleElement).toBeInTheDocument();
});

test('renders Toggler component', () => {
  render(<App />);
  const stepperElement = screen.getByText(/Estado de Debug/i);
  expect(stepperElement).toBeInTheDocument();
});

test('renders User Form component', () => {
  render(<App />);
  const formElement = screen.getByText(/Formulario de Usuario/i);
  expect(formElement).toBeInTheDocument();
});
