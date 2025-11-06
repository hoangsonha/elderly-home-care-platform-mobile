// Store để track tiến độ bài học
interface LessonProgress {
  courseId: string;
  completedLessons: Set<string>; // Format: "moduleId-lessonIndex"
  currentLesson?: {
    moduleId: string;
    lessonIndex: number;
  };
}

const trainingProgress: { [courseId: string]: LessonProgress } = {};

export const markLessonCompleted = (courseId: string, moduleId: string, lessonIndex: number) => {
  if (!trainingProgress[courseId]) {
    trainingProgress[courseId] = {
      courseId,
      completedLessons: new Set(),
    };
  }
  
  const lessonKey = `${moduleId}-${lessonIndex}`;
  trainingProgress[courseId].completedLessons.add(lessonKey);
};

export const isLessonCompleted = (courseId: string, moduleId: string, lessonIndex: number): boolean => {
  if (!trainingProgress[courseId]) {
    return false;
  }
  
  const lessonKey = `${moduleId}-${lessonIndex}`;
  return trainingProgress[courseId].completedLessons.has(lessonKey);
};

export const getFirstIncompleteLesson = (
  courseId: string,
  modules: Array<{ id: string; lessons: Array<any> }>
): { moduleId: string; lessonIndex: number } | null => {
  for (const module of modules) {
    for (let i = 0; i < module.lessons.length; i++) {
      if (!isLessonCompleted(courseId, module.id, i)) {
        return {
          moduleId: module.id,
          lessonIndex: i,
        };
      }
    }
  }
  
  return null; // Tất cả bài đều đã hoàn thành
};

export const setCurrentLesson = (courseId: string, moduleId: string, lessonIndex: number) => {
  if (!trainingProgress[courseId]) {
    trainingProgress[courseId] = {
      courseId,
      completedLessons: new Set(),
    };
  }
  
  trainingProgress[courseId].currentLesson = {
    moduleId,
    lessonIndex,
  };
};

export const getCurrentLesson = (courseId: string) => {
  return trainingProgress[courseId]?.currentLesson || null;
};

