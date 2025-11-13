//Components
import Navbar from '../Navbar/Navbar';
import HandleInGameItems from '../HandleInGameItems/HandleInGameItems';

import { ScreenProvider } from '../../providers/ScreenProvider';

const Homepage = () => {

    return (
        // SCREEN PROVIDER IS TO TRACK SCREEN SIZE AND DYNAMICALLY UPDATE CSS
        <ScreenProvider>
            {/* THIS Handles bulk of Homepage Components */}
            <div style={{ overflow: 'hidden' }}>
                <Navbar />
                <div className="layout-container-items">
                    <HandleInGameItems />
                </div>
            </div>
        </ScreenProvider>
    );
};

export default Homepage;
