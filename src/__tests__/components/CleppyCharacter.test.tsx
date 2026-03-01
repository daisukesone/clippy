import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import CleppyCharacter from '../../components/CleppyCharacter';
import { CleppyProvider } from '../../context/CleppyContext';

function renderWithProvider(ui: React.ReactElement) {
  return render(<CleppyProvider>{ui}</CleppyProvider>);
}

describe('CleppyCharacter', () => {
  it('renders without crashing', () => {
    const { toJSON } = renderWithProvider(<CleppyCharacter />);
    expect(toJSON()).toBeTruthy();
  });

  it('renders default idle emoji', () => {
    const { getByText } = renderWithProvider(<CleppyCharacter />);
    expect(getByText('📎')).toBeTruthy();
  });

  it('calls onPress when pressed', () => {
    const onPress = jest.fn();
    const { getByText } = renderWithProvider(
      <CleppyCharacter onPress={onPress} />
    );
    fireEvent.press(getByText('📎'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('renders with custom size', () => {
    const { toJSON } = renderWithProvider(<CleppyCharacter size={80} />);
    expect(toJSON()).toBeTruthy();
  });
});
