import express from 'express';

const searchRouter = express.Router();

// Static tools data for search
const staticTools = [
  { id: 'cgpa', title: 'CGPA Calculator', path: '/', icon: 'Calculator' },
  { id: 'typing', title: 'Typing Test', path: '/', icon: 'Keyboard' },
  { id: 'pomodoro', title: 'Pomodoro Timer', path: '/pomodoro', icon: 'Timer' },
  { id: 'study', title: 'Study Manager', path: '/', icon: 'BookOpen' },
  { id: 'study-room', title: 'Live Study Room', path: '/study-room', icon: 'Users' },
  { id: 'analytics', title: 'Student Analytics', path: '/analytics', icon: 'BarChart3' },
];

searchRouter.get('/', (req, res) => {
  const query = (req.query.q as string || '').toLowerCase();
  
  if (!query) {
    return res.json([]);
  }

  // Filter tools
  const toolResults = staticTools.filter(t => 
    t.title.toLowerCase().includes(query) || 
    t.id.toLowerCase().includes(query)
  ).map(t => ({ ...t, type: 'tool' }));

  return res.json([...toolResults]);
});

export default searchRouter;
