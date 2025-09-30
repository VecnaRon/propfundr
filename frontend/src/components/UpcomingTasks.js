import React, { useState, useEffect } from 'react';
import axios from 'axios';
import "../styles/UpcomingTasks.css";

const UpcomingTasks = ({ ownerId }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newTask, setNewTask] = useState({ title: '', description: '', due_date: '', status: 'pending' });

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const token = sessionStorage.getItem("token");
        if (!token) {
          setError('Authentication token is missing.');
          setLoading(false);
          return;
        }

        const response = await axios.get(`http://192.168.100.30:5000/api/tasks?user_id=${ownerId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setTasks(response.data);
      } catch (error) {
        console.error('Error fetching tasks:', error);
        setError('Failed to load tasks. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [ownerId]);

  const handleCreateTask = async () => {
    try {
      if (!newTask.title || !newTask.due_date) {
        setError('Title and due date are required.');
        return;
      }

     const token = sessionStorage.getItem("token");
      if (!token) {
        setError('Authentication token is missing.');
        return;
      }

      const response = await axios.post('http://192.168.100.30:5000/api/tasks', newTask, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setTasks([...tasks, response.data]);
      setNewTask({ title: '', description: '', due_date: '', status: 'pending' });
      setError('');
    } catch (error) {
      console.error('Error creating task:', error);
      setError('Failed to create task. Please try again later.');
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
    const token = sessionStorage.getItem("token");
      if (!token) {
        setError('Authentication token is missing.');
        return;
      }

      const response = await axios.delete(`http://192.168.100.30:5000/api/tasks/${taskId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setTasks(tasks.filter(task => task.id !== taskId));
    } catch (error) {
      console.error('Error deleting task:', error);
      setError('Failed to delete task. Please try again later.');
    }
  };

  const handleUpdateTask = async (taskId, updatedStatus) => {
    try {
    const token = sessionStorage.getItem("token");
      if (!token) {
        setError('Authentication token is missing.');
        return;
      }

      const response = await axios.put(`http://192.168.100.30:5000/api/tasks/${taskId}`, { status: updatedStatus }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setTasks(tasks.map(task => task.id === taskId ? { ...task, status: updatedStatus } : task));
    } catch (error) {
      console.error('Error updating task:', error);
      setError('Failed to update task. Please try again later.');
    }
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    if (isNaN(date)) return 'Invalid Date';
    return date.toLocaleDateString();
  };

  if (loading) {
    return <p>Loading tasks...</p>;
  }

  return (
    <div className="upcoming-tasks-container">
      {/* Task Creation Section */}
      <div className="task-creation">
        <h4>Create New Task</h4>
        <div className="task-form">
          <input
            type="text"
            placeholder="Task Title"
            value={newTask.title}
            onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
          />
          <textarea
            placeholder="Task Description"
            value={newTask.description}
            onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
          />
          <input
            type="date"
            value={newTask.due_date}
            onChange={(e) => setNewTask({ ...newTask, due_date: e.target.value })}
          />
          <button onClick={handleCreateTask}>Create Task</button>
        </div>
      </div>

      {/* Task Display Section */}
      <div className="tasks-display">
        <h3>Upcoming Deadlines & Tasks</h3>
        {error && <p className="error-message">{error}</p>}
        {tasks.length === 0 ? (
          <p>No upcoming tasks.</p>
        ) : (
          <ul className="task-list">
            {tasks.map((task) => (
              <li key={task.id} className={`task-item ${task.status === 'completed' ? 'completed' : ''}`}>
                <div className="task-info">
                  <h4>{task.title}</h4>
                  <p>{task.description}</p>
                  <p><strong>Due:</strong> {formatDate(task.due_date)}</p>
                  <p><strong>Status:</strong> {task.status}</p>
                </div>
                <div className="task-actions">
                  <button onClick={() => handleUpdateTask(task.id, 'completed')}>Mark as Completed</button>
                  <button onClick={() => handleDeleteTask(task.id)}>Delete Task</button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default UpcomingTasks;
