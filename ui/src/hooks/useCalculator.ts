import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import type { UserInput, Workout, MacroResult } from '../types';
import { macroService } from '../services/api';

export type CalculatorStep = 1 | 2 | 3;

interface CalculatorState {
  step: CalculatorStep;
  userInput: UserInput | null;
  workouts: Workout[];
  result: MacroResult | null;
  isLoading: boolean;
  error: string | null;
}

export function useCalculator() {
  const navigate = useNavigate();
  const [state, setState] = useState<CalculatorState>({
    step: 1,
    userInput: null,
    workouts: [],
    result: null,
    isLoading: false,
    error: null,
  });

  const setUserInput = useCallback((userInput: UserInput) => {
    setState((prev) => ({
      ...prev,
      userInput,
      step: 2,
    }));
  }, []);

  const setWorkouts = useCallback((workouts: Workout[]) => {
    setState((prev) => ({
      ...prev,
      workouts,
    }));
  }, []);

  const goToStep = useCallback((step: CalculatorStep) => {
    setState((prev) => ({ ...prev, step }));
  }, []);

  const calculateMacros = useCallback(async () => {
    if (!state.userInput || state.workouts.length === 0) {
      setState((prev) => ({
        ...prev,
        error: 'Please complete all steps before calculating',
      }));
      return;
    }

    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await macroService.calculate({
        userInput: state.userInput,
        workouts: state.workouts,
      });

      if (response.success && response.data) {
        setState((prev) => ({
          ...prev,
          result: response.data!,
          step: 3,
          isLoading: false,
        }));
        navigate(`/results/${response.data.id}`);
      } else {
        setState((prev) => ({
          ...prev,
          error: response.error || 'Failed to calculate macros',
          isLoading: false,
        }));
      }
    } catch {
      setState((prev) => ({
        ...prev,
        error: 'An unexpected error occurred',
        isLoading: false,
      }));
    }
  }, [state.userInput, state.workouts, navigate]);

  const reset = useCallback(() => {
    setState({
      step: 1,
      userInput: null,
      workouts: [],
      result: null,
      isLoading: false,
      error: null,
    });
  }, []);

  return {
    ...state,
    setUserInput,
    setWorkouts,
    goToStep,
    calculateMacros,
    reset,
  };
}

