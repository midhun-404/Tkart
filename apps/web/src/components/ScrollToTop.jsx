import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop = () => {
    const { pathname, search } = useLocation();

    useEffect(() => {
        // Using a short timeout ensures the browser renders the new page
        // before we force the scroll position to the very top.
        setTimeout(() => {
            window.scrollTo(0, 0);
            document.documentElement.scrollTo(0, 0);
            document.body.scrollTo(0, 0);
        }, 10);
    }, [pathname, search]);

    return null;
};

export default ScrollToTop;
