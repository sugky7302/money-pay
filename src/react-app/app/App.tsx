// Main App Component

import { GoogleOAuthWrapper } from "../features/auth/ui/GoogleOAuthWrapper";
import { AppContent } from "./AppContent";
import { AppProvider } from "./AppContext";
import { AuthProvider } from "./AuthContext";

export default function App() {
  return (
    <GoogleOAuthWrapper>
      <AuthProvider>
        <AppProvider>
          <AppContent />
        </AppProvider>
      </AuthProvider>
    </GoogleOAuthWrapper>
  );
};
