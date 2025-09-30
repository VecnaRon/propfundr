import { useNavigate } from 'react-router-dom';

const useCreateProject = () => {
  const navigate = useNavigate();

  const createNewProject = () => {
    navigate('/create-project');
  };

  return createNewProject;
};

export default useCreateProject;
