interface TaskDisplayProps {
  dark: boolean;
  task: string;
}

const TaskDisplay = ({ dark, task }: TaskDisplayProps) => {
  if (!task) return null;

  return (
    <h4 className={`text-xs tracking-widest uppercase font-medium ${dark ? 'text-forest-600' : 'text-forest-400'}`}>
      I am working on: {task}
    </h4>
  );
};

export default TaskDisplay;
