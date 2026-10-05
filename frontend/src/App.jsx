import AppRoutes from "./routes/AppRoutes";
import PageTitleUpdater from "./components/common/PageTitleUpdater";

function App() {
    return (
        <>
            <PageTitleUpdater />
            <AppRoutes />
        </>
    );
}

export default App;