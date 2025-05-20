import { Link } from "react-router-dom";
import "./General.scss";
function Body() {
  const tryNow = () => {};
  return (
    <>
      <div className="body-intro">
        <div className="body-item">
          <img
            className="img-content"
            src="https://minhtuanmobile.com/uploads/blog/anime-solo-leveling-he-lo-thoi-gian-ra-mat-so-tap-dien-vien-long-tieng-dang-edit-231025102131.jpg"
          />
          <Link to="/home" className="title-content">
            Try Now !
          </Link>
        </div>
        <div className="body-item">
          <img
            className="img-content"
            src="https://static1.cbrimages.com/wordpress/wp-content/uploads/2023/10/solo-leveling.jpg"
          />
          <Link className="title-content">About Website !</Link>
        </div>
        <div className="body-item">
          <img
            className="img-content"
            src="https://image-repository-cdn.tappytoon.com/series/20/fcaf7325-b78f-430b-9545-bd63f485a1a0.jpg?size=large"
          />
          <Link className="title-content">Contact !</Link>
        </div>
      </div>
    </>
  );
}

export default Body;
