
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { SoundProvider } from "./contexts/SoundContext";
import { GameNotificationProvider } from "./contexts/GameNotificationContext";
import { GameNotificationManager } from "./components/game/GameNotificationManager";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <SoundProvider>
        <GameNotificationProvider>
          <GameNotificationManager />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </GameNotificationProvider>
      </SoundProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
