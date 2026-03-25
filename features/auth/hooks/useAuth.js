import { useAuth as useAuthContext } from '../context/AuthContext';

// this keeps imports simple in screens and components
// it also gives us one auth entry point if the setup changes later
export const useAuth = () => useAuthContext();

export default useAuth;
