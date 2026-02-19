export interface ExerciseInfo {
  name: string;
  description: string;
}

export function getExerciseMuscleGroup(name: string): string | null {
  for (const [group, exercises] of Object.entries(DEFAULT_EXERCISES)) {
    if (exercises.some((e) => e.name === name)) return group;
  }
  return null;
}


export const DEFAULT_EXERCISES: Record<string, ExerciseInfo[]> = {
  Chest: [
    { name: "Bench Press", description: "Lie flat on a bench and press a barbell up from chest level" },
    { name: "Incline Bench Press", description: "Press a barbell upward on a 30-45 degree incline bench, targeting upper chest" },
    { name: "Dumbbell Fly", description: "Lie flat and arc dumbbells outward and together in a hugging motion" },
    { name: "Cable Crossover", description: "Pull cable handles from high or low pulleys together in front of your chest" },
    { name: "Push-Up", description: "Lower and push your body up from the floor using your arms" },
    { name: "Dumbbell Press", description: "Lie flat on a bench and press dumbbells up from chest level" },
  ],
  Back: [
    { name: "Deadlift", description: "Lift a barbell from the floor to hip level by extending your hips and knees" },
    { name: "Barbell Row", description: "Bend forward and pull a barbell from the floor toward your lower chest" },
    { name: "Lat Pulldown", description: "Pull a wide bar down to your upper chest on a cable machine" },
    { name: "Seated Cable Row", description: "Pull a cable handle toward your torso while seated with legs braced" },
    { name: "Pull-Up", description: "Hang from a bar and pull your body up until your chin clears the bar" },
    { name: "T-Bar Row", description: "Straddle a landmine bar and row the weighted end toward your chest" },
  ],
  Shoulders: [
    { name: "Overhead Press", description: "Press a barbell or dumbbells from shoulder height to overhead" },
    { name: "Lateral Raise", description: "Raise dumbbells out to your sides until arms are parallel to the floor" },
    { name: "Front Raise", description: "Raise dumbbells in front of you to shoulder height" },
    { name: "Face Pull", description: "Pull a rope attachment on a cable toward your face, elbows flared high" },
    { name: "Arnold Press", description: "Rotate dumbbells from a palms-in curl position to a standard overhead press" },
    { name: "Reverse Fly", description: "Bend forward and raise dumbbells outward to target the rear delts" },
  ],
  Arms: [
    { name: "Barbell Curl", description: "Curl a barbell upward by bending your elbows, targeting biceps" },
    { name: "Dumbbell Curl", description: "Curl dumbbells upward alternating or together, targeting biceps" },
    { name: "Hammer Curl", description: "Curl dumbbells with a neutral (palms-in) grip, targeting biceps and forearms" },
    { name: "Tricep Pushdown", description: "Push a cable bar or rope downward by extending your elbows" },
    { name: "Skull Crusher", description: "Lie on a bench and lower a barbell toward your forehead, then extend" },
    { name: "Dip", description: "Lower and press your body up on parallel bars, targeting triceps and chest" },
  ],
  Legs: [
    { name: "Squat", description: "Lower your body by bending your knees with a barbell on your back, then stand" },
    { name: "Leg Press", description: "Push a weighted platform away from you using your legs on a machine" },
    { name: "Romanian Deadlift", description: "Hinge at the hips with a slight knee bend, lowering a barbell along your legs" },
    { name: "Leg Curl", description: "Curl your heels toward your glutes on a machine, targeting hamstrings" },
    { name: "Leg Extension", description: "Extend your legs outward on a machine, targeting quadriceps" },
    { name: "Calf Raise", description: "Rise onto your toes while standing or seated to target your calves" },
    { name: "Lunge", description: "Step forward and lower your back knee toward the floor, then push back up" },
    { name: "Bulgarian Split Squat", description: "Squat on one leg with your rear foot elevated on a bench behind you" },
  ],
  Core: [
    { name: "Plank", description: "Hold a push-up position on your forearms, keeping your body in a straight line" },
    { name: "Cable Crunch", description: "Kneel below a cable and crunch downward against the resistance" },
    { name: "Hanging Leg Raise", description: "Hang from a bar and raise your legs in front of you" },
    { name: "Ab Wheel Rollout", description: "Kneel and roll an ab wheel forward, then pull it back using your core" },
    { name: "Russian Twist", description: "Sit with feet raised and rotate your torso side to side with a weight" },
  ],
};
