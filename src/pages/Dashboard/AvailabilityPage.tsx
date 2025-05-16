
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm, SubmitHandler } from "react-hook-form";
import { toast } from "@/hooks/use-toast";
import DashboardLayout from "@/components/Dashboard/DashboardLayout";
import DashboardHeader from "@/components/Dashboard/DashboardHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { TimeSlot } from "@/types";

// Day of week representation
const daysOfWeek = [
  { value: 0, label: "Domingo" },
  { value: 1, label: "Segunda-feira" },
  { value: 2, label: "Terça-feira" },
  { value: 3, label: "Quarta-feira" },
  { value: 4, label: "Quinta-feira" },
  { value: 5, label: "Sexta-feira" },
  { value: 6, label: "Sábado" },
];

// Time options for selects
const generateTimeOptions = () => {
  const options = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const formattedHour = hour.toString().padStart(2, "0");
      const formattedMinute = minute.toString().padStart(2, "0");
      options.push(`${formattedHour}:${formattedMinute}`);
    }
  }
  return options;
};

const timeOptions = generateTimeOptions();

// Mock time slots for demonstration
const mockTimeSlots: TimeSlot[] = [
  { id: "1", userId: "current-user", dayOfWeek: 1, startTime: "09:00", endTime: "12:00", isAvailable: true },
  { id: "2", userId: "current-user", dayOfWeek: 1, startTime: "14:00", endTime: "18:00", isAvailable: true },
  { id: "3", userId: "current-user", dayOfWeek: 3, startTime: "09:00", endTime: "12:00", isAvailable: true },
  { id: "4", userId: "current-user", dayOfWeek: 3, startTime: "14:00", endTime: "18:00", isAvailable: true },
  { id: "5", userId: "current-user", dayOfWeek: 5, startTime: "09:00", endTime: "13:00", isAvailable: true },
];

interface DayAvailability {
  dayOfWeek: number;
  isAvailable: boolean;
  timeSlots: {
    id?: string;
    startTime: string;
    endTime: string;
  }[];
}

// Initial availability data structure
const initialAvailability: DayAvailability[] = daysOfWeek.map(day => ({
  dayOfWeek: day.value,
  isAvailable: false,
  timeSlots: [{ startTime: "09:00", endTime: "17:00" }]
}));

// Convert mock time slots to our state format
const convertTimeSlotsToAvailability = (timeSlots: TimeSlot[]): DayAvailability[] => {
  const availability = [...initialAvailability];
  
  // Group time slots by day
  const timeSlotsByDay: Record<number, TimeSlot[]> = {};
  
  timeSlots.forEach(slot => {
    if (!timeSlotsByDay[slot.dayOfWeek]) {
      timeSlotsByDay[slot.dayOfWeek] = [];
    }
    timeSlotsByDay[slot.dayOfWeek].push(slot);
  });
  
  // Update availability with time slots
  Object.entries(timeSlotsByDay).forEach(([day, slots]) => {
    const dayIndex = availability.findIndex(a => a.dayOfWeek === parseInt(day));
    if (dayIndex !== -1) {
      availability[dayIndex].isAvailable = true;
      availability[dayIndex].timeSlots = slots.map(slot => ({
        id: slot.id,
        startTime: slot.startTime,
        endTime: slot.endTime
      }));
    }
  });
  
  return availability;
};

const AvailabilityPage = () => {
  const queryClient = useQueryClient();
  
  // Fetch time slots
  const { data: timeSlots, isLoading } = useQuery({
    queryKey: ["timeSlots"],
    queryFn: async () => {
      // This would be a real API call
      console.log("Fetching time slots...");
      return mockTimeSlots;
    }
  });
  
  // Convert fetched time slots to our state format
  const [availability, setAvailability] = useState<DayAvailability[]>(
    timeSlots ? convertTimeSlotsToAvailability(timeSlots) : initialAvailability
  );

  // Update availability when time slots data is loaded
  useState(() => {
    if (timeSlots) {
      setAvailability(convertTimeSlotsToAvailability(timeSlots));
    }
  });
  
  // Save availability mutation
  const mutation = useMutation({
    mutationFn: async (data: DayAvailability[]) => {
      // This would be a real API call
      console.log("Saving availability:", data);
      
      // Convert availability to time slots format for API
      const apiTimeSlots: Omit<TimeSlot, "id">[] = [];
      
      data.forEach(day => {
        if (day.isAvailable) {
          day.timeSlots.forEach(slot => {
            apiTimeSlots.push({
              userId: "current-user",
              dayOfWeek: day.dayOfWeek,
              startTime: slot.startTime,
              endTime: slot.endTime,
              isAvailable: true
            });
          });
        }
      });
      
      // Simulate API call
      return new Promise<TimeSlot[]>((resolve) => {
        setTimeout(() => {
          // Create mock response with IDs
          const response = apiTimeSlots.map((slot, index) => ({
            ...slot,
            id: `new-${index}`
          }));
          resolve(response);
        }, 800);
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["timeSlots"] });
      toast({
        title: "Disponibilidade salva",
        description: "Seus horários de atendimento foram atualizados com sucesso.",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível salvar seus horários de atendimento.",
        variant: "destructive",
      });
    }
  });
  
  const handleDayToggle = (dayIndex: number) => {
    setAvailability(prev => {
      const updated = [...prev];
      updated[dayIndex] = {
        ...updated[dayIndex],
        isAvailable: !updated[dayIndex].isAvailable
      };
      return updated;
    });
  };
  
  const handleAddTimeSlot = (dayIndex: number) => {
    setAvailability(prev => {
      const updated = [...prev];
      const lastSlot = updated[dayIndex].timeSlots[updated[dayIndex].timeSlots.length - 1];
      updated[dayIndex] = {
        ...updated[dayIndex],
        timeSlots: [
          ...updated[dayIndex].timeSlots,
          { startTime: lastSlot.endTime, endTime: "18:00" }
        ]
      };
      return updated;
    });
  };
  
  const handleRemoveTimeSlot = (dayIndex: number, slotIndex: number) => {
    setAvailability(prev => {
      const updated = [...prev];
      updated[dayIndex] = {
        ...updated[dayIndex],
        timeSlots: updated[dayIndex].timeSlots.filter((_, i) => i !== slotIndex)
      };
      return updated;
    });
  };
  
  const handleTimeChange = (dayIndex: number, slotIndex: number, field: "startTime" | "endTime", value: string) => {
    setAvailability(prev => {
      const updated = [...prev];
      updated[dayIndex].timeSlots[slotIndex][field] = value;
      return updated;
    });
  };
  
  const handleSubmit = () => {
    mutation.mutate(availability);
  };
  
  const validateTimeSlots = () => {
    let isValid = true;
    
    // Check for overlapping or invalid time slots
    availability.forEach(day => {
      if (day.isAvailable && day.timeSlots.length > 0) {
        // Sort time slots by start time
        const sortedSlots = [...day.timeSlots].sort((a, b) => 
          a.startTime.localeCompare(b.startTime)
        );
        
        for (let i = 0; i < sortedSlots.length; i++) {
          // Check if end time is after start time
          if (sortedSlots[i].endTime <= sortedSlots[i].startTime) {
            isValid = false;
            toast({
              title: "Horário inválido",
              description: `O horário de término deve ser depois do horário de início para ${daysOfWeek.find(d => d.value === day.dayOfWeek)?.label}.`,
              variant: "destructive",
            });
            return isValid;
          }
          
          // Check for overlaps with next slot
          if (i < sortedSlots.length - 1) {
            if (sortedSlots[i].endTime > sortedSlots[i + 1].startTime) {
              isValid = false;
              toast({
                title: "Horários sobrepostos",
                description: `Você tem horários sobrepostos em ${daysOfWeek.find(d => d.value === day.dayOfWeek)?.label}.`,
                variant: "destructive",
              });
              return isValid;
            }
          }
        }
      }
    });
    
    return isValid;
  };
  
  const handleSave = () => {
    if (validateTimeSlots()) {
      handleSubmit();
    }
  };
  
  return (
    <DashboardLayout>
      <div className="container mx-auto py-8">
        <DashboardHeader
          title="Disponibilidade"
          subtitle="Configure os dias e horários em que você está disponível para atendimentos"
        />

        {isLoading ? (
          <div className="flex justify-center items-center h-40">
            <p>Carregando configurações de disponibilidade...</p>
          </div>
        ) : (
          <>
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Dias e horários de atendimento</CardTitle>
                <CardDescription>
                  Selecione os dias em que você atende e configure os horários disponíveis para cada dia.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {availability.map((day, dayIndex) => (
                    <div key={day.dayOfWeek} className="p-4 border rounded-md">
                      <div className="flex items-center mb-4">
                        <Checkbox
                          id={`day-${day.dayOfWeek}`}
                          checked={day.isAvailable}
                          onCheckedChange={() => handleDayToggle(dayIndex)}
                        />
                        <label
                          htmlFor={`day-${day.dayOfWeek}`}
                          className="ml-2 font-medium"
                        >
                          {daysOfWeek.find(d => d.value === day.dayOfWeek)?.label}
                        </label>
                      </div>

                      {day.isAvailable && (
                        <div className="space-y-4">
                          {day.timeSlots.map((slot, slotIndex) => (
                            <div key={slotIndex} className="flex items-center space-x-3">
                              <div className="grid grid-cols-2 gap-3 flex-1">
                                <div>
                                  <label className="text-sm text-muted-foreground">
                                    Início
                                  </label>
                                  <Select
                                    value={slot.startTime}
                                    onValueChange={(value) =>
                                      handleTimeChange(dayIndex, slotIndex, "startTime", value)
                                    }
                                  >
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {timeOptions.map((time) => (
                                        <SelectItem key={time} value={time}>
                                          {time}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>

                                <div>
                                  <label className="text-sm text-muted-foreground">
                                    Término
                                  </label>
                                  <Select
                                    value={slot.endTime}
                                    onValueChange={(value) =>
                                      handleTimeChange(dayIndex, slotIndex, "endTime", value)
                                    }
                                  >
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {timeOptions.map((time) => (
                                        <SelectItem key={time} value={time}>
                                          {time}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>

                              {day.timeSlots.length > 1 && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-10 w-10 rounded-full hover:bg-destructive/10 hover:text-destructive"
                                  onClick={() => handleRemoveTimeSlot(dayIndex, slotIndex)}
                                >
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="16"
                                    height="16"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  >
                                    <path d="M18 6 6 18" />
                                    <path d="m6 6 12 12" />
                                  </svg>
                                  <span className="sr-only">Remover horário</span>
                                </Button>
                              )}
                            </div>
                          ))}

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleAddTimeSlot(dayIndex)}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="mr-1"
                            >
                              <path d="M5 12h14" />
                              <path d="M12 5v14" />
                            </svg>
                            Adicionar intervalo
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button 
                className="bg-kendrah-purple hover:bg-kendrah-purple/90"
                onClick={handleSave}
                disabled={mutation.isPending}
              >
                {mutation.isPending ? "Salvando..." : "Salvar disponibilidade"}
              </Button>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AvailabilityPage;
