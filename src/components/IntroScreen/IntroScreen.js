import Body from "./Body";
import Footer from "./Footer";
import Header from "./Header";
import "./General.scss";
function IntroScreen() {
    return (
        <>
            <div className="intro">
                <Header></Header>
                <Body></Body>
                <Footer></Footer>
            </div>
        </>
    )
}
export default IntroScreen;