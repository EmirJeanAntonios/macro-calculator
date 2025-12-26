import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import type { WorkoutTypeOption } from "../types";
import { macroService } from "../services/api";

interface WorkoutTypesContextType {
  workoutTypes: WorkoutTypeOption[];
  isLoading: boolean;
  error: string | null;
  getWorkoutType: (key: string) => WorkoutTypeOption | undefined;
  refreshWorkoutTypes: () => Promise<void>;
}

const WorkoutTypesContext = createContext<WorkoutTypesContextType | undefined>(
  undefined
);

export function WorkoutTypesProvider({ children }: { children: ReactNode }) {
  const [workoutTypes, setWorkoutTypes] = useState<WorkoutTypeOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWorkoutTypes = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await macroService.getWorkoutTypes();
      if (response.success && response.data) {
        setWorkoutTypes(response.data);
      } else {
        setError("Failed to fetch workout types");
      }
    } catch (err) {
      setError("Failed to fetch workout types");
      console.error("Error fetching workout types:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkoutTypes();
  }, []);

  const getWorkoutType = (key: string): WorkoutTypeOption | undefined => {
    return workoutTypes.find((t) => t.key === key);
  };

  const refreshWorkoutTypes = async () => {
    await fetchWorkoutTypes();
  };

  return (
    <WorkoutTypesContext.Provider
      value={{
        workoutTypes,
        isLoading,
        error,
        getWorkoutType,
        refreshWorkoutTypes,
      }}
    >
      {children}
    </WorkoutTypesContext.Provider>
  );
}

export function useWorkoutTypes(): WorkoutTypesContextType {
  const context = useContext(WorkoutTypesContext);
  if (context === undefined) {
    throw new Error(
      "useWorkoutTypes must be used within a WorkoutTypesProvider"
    );
  }
  return context;
}
