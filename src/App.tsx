import { useEffect, useState } from 'react';
import { UserProvider, useUser } from './hooks/useUser';
import { DownloadsProvider } from './lib/downloads';
import { useHubState } from './lib/storage';
import { topicById } from './data/topics';
import { Shell } from './components/Shell';
import { Home } from './components/Home';
import { TopicPage } from './components/TopicPage';
import { Login } from './components/Login';

interface Route {
  topicId: string | null;
  section?: string;
}

function parseHash(hash: string): Route {
  const h = hash.replace(/^#\/?/, '');
  const parts = h.split('/').filter(Boolean);
  if (parts[0] === 'topic' && parts[1]) {
    return { topicId: parts[1], section: parts[2] };
  }
  return { topicId: null };
}

function useRoute(): Route {
  const [route, setRoute] = useState<Route>(() => parseHash(window.location.hash));
  useEffect(() => {
    const onChange = () => setRoute(parseHash(window.location.hash));
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);
  return route;
}

function HubApp() {
  const route = useRoute();
  const { state, toggleCheck, setDone, setValues } = useHubState();
  const topic = topicById(route.topicId ?? undefined);

  return (
    <Shell current={topic ? topic.id : null} done={state.done}>
      {topic ? (
        <TopicPage
          key={topic.id}
          topic={topic}
          section={route.section}
          state={state}
          toggleCheck={toggleCheck}
          setDone={setDone}
          setValues={setValues}
        />
      ) : (
        <Home done={state.done} />
      )}
    </Shell>
  );
}

function Gate() {
  const { user } = useUser();
  return user ? <HubApp /> : <Login />;
}

export default function App() {
  return (
    <UserProvider>
      <DownloadsProvider>
        <Gate />
      </DownloadsProvider>
    </UserProvider>
  );
}
