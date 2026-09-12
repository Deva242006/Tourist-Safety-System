import { Navigate } from 'react-router-dom';
import { getSession } from '../api/auth';
import { getOfficerSession } from '../api/officers';

export default function PrivateRoute({ children, role }) {
    const userSession = getSession();
    const officerSession = getOfficerSession();

    if (role === 'tourist') {
        if (!userSession) return <Navigate to="/login" replace />;
        return children;
    }

    if (role === 'admin') {
        // We can add an admin check here if there's a specific admin session, 
        // but for now relying on userSession or a distinct admin mechanism.
        // Assuming admin login sets some specific flag or just normal login for now.
        // Let's assume standard session for admin for now as per current setup, 
        // or redirect to login.
        if (!userSession) return <Navigate to="/login" replace />;
        return children;
    }

    if (role === 'officer') {
        if (!officerSession) return <Navigate to="/officer-login" replace />;
        return children;
    }

    return children;
}
