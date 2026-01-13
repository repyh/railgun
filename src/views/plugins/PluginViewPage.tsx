import { useParams, useOutletContext } from 'react-router-dom';
import { PluginViewHost } from '@/components/plugins/PluginViewHost';

const PluginViewPage = () => {
    const { viewId } = useParams<{ viewId: string }>();
    const { setStatus } = useOutletContext<{ setStatus: (s: string) => void }>();

    if (!viewId) {
        return (
            <div className="h-full w-full flex items-center justify-center text-zinc-500">
                Invalid Plugin View ID
            </div>
        );
    }

    return (
        <div className="h-full w-full bg-background overflow-hidden">
            <PluginViewHost viewId={viewId} setStatus={setStatus} />
        </div>
    );
};

export default PluginViewPage;
