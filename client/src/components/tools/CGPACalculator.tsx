import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Trash2, 
  Plus, 
  TrendingUp, 
  Award, 
  BookOpen, 
  RotateCcw,
  Layers,
  Target,
  Sparkles,
  Calculator
} from "lucide-react";
import { toast } from "sonner";
import { useCgpaStore } from "@/store/useCgpaStore";
import { useForm } from "react-hook-form";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const GRADE_OPTIONS = [
  { label: "A+ (4.00)", value: 4.0 },
  { label: "A (3.75)", value: 3.75 },
  { label: "A- (3.50)", value: 3.5 },
  { label: "B+ (3.25)", value: 3.25 },
  { label: "B (3.00)", value: 3.0 },
  { label: "B- (2.75)", value: 2.75 },
  { label: "C+ (2.50)", value: 2.5 },
  { label: "C (2.25)", value: 2.25 },
  { label: "D (2.00)", value: 2.0 },
  { label: "F (0.00)", value: 0.0 },
];

const courseSchema = z.object({
  name: z.string().min(1, "Course name is required"),
  creditHours: z.number().min(0.5, "Min 0.5").max(10, "Max 10"),
  grade: z.number().min(0, "Min 0").max(4.0, "Max 4.0"),
});

type CourseFormValues = z.infer<typeof courseSchema>;

function AnimatedGPA({ value }: { value: number }) {
  const [displayVal, setDisplayVal] = useState(value);

  useEffect(() => {
    let startTimestamp: number | null = null;
    const startValue = displayVal;
    const endValue = value;
    const duration = 500;

    if (Math.abs(startValue - endValue) < 0.001) {
      setDisplayVal(endValue);
      return;
    }

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const current = startValue + (endValue - startValue) * easeProgress;
      setDisplayVal(current);
      if (progress < 1) {
        requestAnimationFrame(step);
      }
    };

    const animFrame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animFrame);
  }, [value]);

  return <span>{displayVal.toFixed(2)}</span>;
}

export default function CGPACalculator() {
  const { courses, addCourse, removeCourse, updateCourse, clearAll } = useCgpaStore();
  const [targetCgpa, setTargetCgpa] = useState<string>("3.75");
  const [remainingCredits, setRemainingCredits] = useState<string>("24");

  const form = useForm<CourseFormValues>({
    resolver: zodResolver(courseSchema),
    defaultValues: { name: "", creditHours: 3, grade: 4.0 },
  });

  const onSubmit = (data: CourseFormValues) => {
    addCourse(data);
    form.reset({ name: "", creditHours: 3, grade: 4.0 });
    toast.success("Course added successfully");
  };

  const handleUpdate = (id: string, field: 'name' | 'creditHours' | 'grade', value: any) => {
    if (field === "grade" && (value > 4.0 || value < 0)) {
      toast.error("Grade must be between 0 and 4.0");
      return;
    }
    updateCourse(id, field, value);
  };

  const calculateCGPA = () => {
    if (courses.length === 0) return "0.00";
    const totalPoints = courses.reduce((sum, c) => sum + c.grade * c.creditHours, 0);
    const totalCredits = courses.reduce((sum, c) => sum + c.creditHours, 0);
    return (totalPoints / totalCredits).toFixed(2);
  };

  const totalCredits = courses.reduce((sum, c) => sum + c.creditHours, 0);
  const totalEarnedPoints = courses.reduce((sum, c) => sum + c.grade * c.creditHours, 0);
  const cgpaValue = parseFloat(calculateCGPA());

  const getCgpaStatus = (cgpa: number) => {
    if (cgpa >= 3.75) return { label: "High Distinction", color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/30" };
    if (cgpa >= 3.25) return { label: "Distinction", color: "text-blue-500 bg-blue-500/10 border-blue-500/30" };
    if (cgpa >= 3.0) return { label: "Good Standing", color: "text-indigo-500 bg-indigo-500/10 border-indigo-500/30" };
    if (cgpa >= 2.0) return { label: "Satisfactory", color: "text-amber-500 bg-amber-500/10 border-amber-500/30" };
    return { label: "Needs Improvement", color: "text-rose-500 bg-rose-500/10 border-rose-500/30" };
  };

  const status = getCgpaStatus(cgpaValue);

  // Target CGPA Logic for 3rd/4th Year Students
  const calculateRequiredGPA = () => {
    const target = parseFloat(targetCgpa);
    const remaining = parseFloat(remainingCredits);
    if (isNaN(target) || isNaN(remaining) || remaining <= 0) return null;

    const totalNeededCredits = totalCredits + remaining;
    const totalNeededPoints = target * totalNeededCredits;
    const requiredPointsFromRemaining = totalNeededPoints - totalEarnedPoints;
    const requiredGPA = requiredPointsFromRemaining / remaining;

    return requiredGPA;
  };

  const requiredGPA = calculateRequiredGPA();

  return (
    <div className="space-y-5">
      {/* Top Action Bar */}
      {courses.length > 0 && (
        <div className="flex justify-end">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm" className="text-rose-500 border-rose-500/30 hover:bg-rose-500/10 rounded-xl h-8 text-xs">
                <Trash2 className="w-3.5 h-3.5 mr-1" /> Clear All Courses
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="premium-card border-border rounded-2xl shadow-2xl">
              <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center gap-2 text-foreground">
                  <RotateCcw className="w-5 h-5 text-rose-500" /> Clear All Courses?
                </AlertDialogTitle>
                <AlertDialogDescription className="text-muted-foreground">
                  This action will delete all added courses from your browser storage.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="bg-transparent text-foreground border-border hover:bg-accent rounded-xl">Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={clearAll} className="bg-rose-500 hover:bg-rose-600 text-white rounded-xl">Clear All</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      )}

      {/* Add Course Form */}
      <div className="premium-card rounded-2xl p-5 shadow-lg border border-border/40">
        <div className="flex items-center gap-2 mb-3">
          <Plus className="w-4 h-4 text-orange-500" />
          <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Add Course</h4>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
            <div className="sm:col-span-4">
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Course Title</label>
              <Input 
                placeholder="e.g. Data Structures" 
                {...form.register("name")} 
                className="h-9 rounded-xl border-border bg-background/50 text-xs"
              />
              {form.formState.errors.name && <p className="text-rose-500 text-[11px] mt-1">{form.formState.errors.name.message}</p>}
            </div>

            <div className="sm:col-span-3">
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Credit Hours</label>
              <Input 
                type="number" 
                step="0.5" 
                min="0.5"
                max="10"
                placeholder="3.0" 
                {...form.register("creditHours", { valueAsNumber: true })} 
                className="h-9 rounded-xl border-border bg-background/50 text-xs"
              />
              {form.formState.errors.creditHours && <p className="text-rose-500 text-[11px] mt-1">{form.formState.errors.creditHours.message}</p>}
            </div>

            <div className="sm:col-span-3">
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Grade</label>
              <select
                {...form.register("grade", { valueAsNumber: true })}
                className="w-full h-9 px-2 text-xs rounded-xl border border-border bg-background/50 text-foreground font-semibold focus:outline-none focus:ring-2 focus:ring-orange-500/50 cursor-pointer"
              >
                {GRADE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value} className="bg-background text-foreground">
                    {opt.label}
                  </option>
                ))}
              </select>
              {form.formState.errors.grade && <p className="text-rose-500 text-[11px] mt-1">{form.formState.errors.grade.message}</p>}
            </div>

            <div className="sm:col-span-2">
              <Button 
                type="submit" 
                className="w-full h-9 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold shadow-md rounded-xl text-xs border-0 flex items-center justify-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add
              </Button>
            </div>
          </div>
        </form>
      </div>

      {/* Courses List Table */}
      {courses.length > 0 && (
        <div className="premium-card rounded-2xl p-5 shadow-lg border border-border/40 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-orange-500" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Enrolled Courses</h4>
            </div>
            <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-orange-500/10 text-orange-500 border border-orange-500/20">
              {courses.length} Courses • {totalCredits} Credits
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border/60 text-muted-foreground uppercase tracking-wider text-[11px]">
                  <th className="text-left py-2 px-2 font-semibold">Course</th>
                  <th className="text-center py-2 px-2 font-semibold">Credits</th>
                  <th className="text-center py-2 px-2 font-semibold">Grade</th>
                  <th className="text-center py-2 px-2 font-semibold">Remove</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {courses.map((course) => (
                  <tr key={course.id} className="hover:bg-accent/40 transition-colors">
                    <td className="py-2 px-2">
                      <Input
                        value={course.name}
                        onChange={(e) => handleUpdate(course.id, "name", e.target.value)}
                        className="h-8 text-xs font-semibold bg-transparent border-transparent hover:border-border rounded-lg"
                      />
                    </td>
                    <td className="text-center py-2 px-2">
                      <Input
                        type="number"
                        value={course.creditHours}
                        onChange={(e) => handleUpdate(course.id, "creditHours", parseFloat(e.target.value) || 0)}
                        className="h-8 text-xs w-16 text-center mx-auto font-semibold bg-transparent border-transparent hover:border-border rounded-lg"
                        min="0.5"
                        step="0.5"
                      />
                    </td>
                    <td className="text-center py-2 px-2">
                      <select
                        value={course.grade}
                        onChange={(e) => handleUpdate(course.id, "grade", parseFloat(e.target.value))}
                        className="h-8 text-xs px-2 rounded-lg border border-border/50 bg-background text-foreground font-semibold cursor-pointer"
                      >
                        {!GRADE_OPTIONS.some((g) => g.value === course.grade) && (
                          <option value={course.grade} className="bg-background text-foreground">
                            {course.grade}
                          </option>
                        )}
                        {GRADE_OPTIONS.map((g) => (
                          <option key={g.value} value={g.value} className="bg-background text-foreground">
                            {g.label}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="text-center py-2 px-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeCourse(course.id)}
                        className="h-7 w-7 text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 rounded-lg"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Results Summary Grid */}
          <div className="pt-3 grid md:grid-cols-2 gap-4">
            {/* CGPA Result Card (Fixed Spelling: CURRENT CGPA) */}
            <div className="premium-card rounded-2xl p-5 bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10 border border-indigo-500/20 flex flex-col justify-between relative overflow-hidden shadow-md">
              <div>
                <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-500 flex items-center gap-1.5">
                    <Award className="w-4 h-4" /> CURRENT CGPA
                  </span>
                  <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${status.color}`}>
                    {status.label}
                  </span>
                </div>

                <div className="my-1">
                  <p className="text-5xl font-black font-mono tracking-tight text-foreground">
                    <AnimatedGPA value={cgpaValue} />
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-indigo-500/15 flex items-center justify-between text-xs text-muted-foreground">
                <span>Courses: <strong className="text-foreground">{courses.length}</strong></span>
                <span>Completed Credits: <strong className="text-foreground">{totalCredits}</strong></span>
              </div>
            </div>
            
            {/* CGPA Scale Progress Card */}
            <div className="premium-card rounded-2xl p-5 flex flex-col justify-between relative overflow-hidden shadow-md border border-border/40">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4 text-purple-500" /> CGPA Progress
                  </p>
                  <span className="text-xs font-mono font-bold text-purple-500">
                    {((cgpaValue / 4.0) * 100).toFixed(1)}%
                  </span>
                </div>

                <div className="w-full bg-muted rounded-full h-4 p-0.5 overflow-hidden relative border border-border/50 my-3">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${(cgpaValue / 4.0) * 100}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="h-full rounded-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-4 text-center text-[10px] text-muted-foreground font-semibold pt-2 border-t border-border/30">
                <div><span>0.0</span></div>
                <div><span>2.0</span></div>
                <div><span>3.0</span></div>
                <div><span className="text-purple-500 font-bold">4.0</span></div>
              </div>
            </div>
          </div>

          {/* 🎯 Target CGPA Calculator Section (Special for 3rd/4th Year Students) */}
          <div className="mt-4 p-5 rounded-2xl bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 border border-indigo-500/20 space-y-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-500">
                <Target className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">Target CGPA Goal Calculator</h4>
                <p className="text-[11px] text-muted-foreground">Calculate the required GPA in remaining semesters to achieve your target CGPA</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="text-[11px] font-medium text-muted-foreground mb-1 block">Target CGPA Goal</label>
                <Input
                  type="number"
                  step="0.05"
                  min="2.0"
                  max="4.0"
                  value={targetCgpa}
                  onChange={(e) => setTargetCgpa(e.target.value)}
                  className="h-8 rounded-xl border-border bg-background/60 text-xs font-semibold"
                  placeholder="e.g. 3.75"
                />
              </div>

              <div>
                <label className="text-[11px] font-medium text-muted-foreground mb-1 block">Remaining Credits (e.g. 24 credits)</label>
                <Input
                  type="number"
                  step="1"
                  min="1"
                  max="100"
                  value={remainingCredits}
                  onChange={(e) => setRemainingCredits(e.target.value)}
                  className="h-8 rounded-xl border-border bg-background/60 text-xs font-semibold"
                  placeholder="e.g. 24"
                />
              </div>
            </div>

            {requiredGPA !== null && (
              <div className="mt-2 p-3 rounded-xl bg-background/80 border border-border/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <span className="text-xs font-medium text-muted-foreground">Required Avg GPA in Remaining {remainingCredits} Credits:</span>
                {requiredGPA > 4.0 ? (
                  <span className="text-xs font-bold text-rose-500 bg-rose-500/10 px-2.5 py-1 rounded-lg border border-rose-500/20">
                    Not Possible (&gt; 4.00) — Lower Target
                  </span>
                ) : requiredGPA < 0 ? (
                  <span className="text-xs font-bold text-emerald-500 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                    Already Achieved Target! 🎉
                  </span>
                ) : (
                  <span className="text-sm font-black text-indigo-500 font-mono bg-indigo-500/10 px-3 py-1 rounded-lg border border-indigo-500/20">
                    {requiredGPA.toFixed(2)} GPA needed
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Empty State */}
      {courses.length === 0 && (
        <div className="premium-card rounded-2xl p-8 text-center shadow-md border border-border/40 flex flex-col items-center justify-center space-y-2">
          <div className="p-3 rounded-full bg-orange-500/10 text-orange-500 border border-orange-500/20">
            <BookOpen className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-semibold text-foreground">No Courses Added Yet</h4>
          <p className="text-xs text-muted-foreground max-w-sm">
            Add your courses above to calculate your CGPA and track your academic progress.
          </p>
        </div>
      )}
    </div>
  );
}
