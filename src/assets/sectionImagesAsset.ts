// Official Studio Management 12 Department High-Resolution Assets
// Preserved permanently in database and local resources for 100% offline usage

import cinemaBannerImg from './images/cinema_camera_banner_1791165179096.jpg';
import weddingBoardImg from './images/wedding_board_frame_1791329701263.jpg';
import weddingSessionImg from './images/wedding_session_palace_1791329710801.jpg';
import studioPhotosImg from './images/studio_portrait_session_1791329721847.jpg';
import photoAlbumsImg from './images/luxury_photo_album_1791329731952.jpg';
import advertisingImg from './images/banner_printing_shop_1791329744641.jpg';
import graphicDesignImg from './images/branding_design_mockup_1791329754567.jpg';
import passportPhotosImg from './images/passport_id_photos_1791329763832.jpg';
import photoRestorationImg from './images/vintage_photo_restoration_1791329773616.jpg';
import canvasPrintsImg from './images/stretched_canvas_gallery_1791329785266.jpg';
import videoMontageImg from './images/video_editing_suite_1791329794357.jpg';
import outdoorPhotoImg from './images/outdoor_wedding_couple_1791329805313.jpg';
import thermalPrintImg from './images/thermal_press_printing_1791329815734.jpg';

export const CINEMA_BANNER_IMAGE = cinemaBannerImg || '/images/cinema_camera_banner_1791165179096.jpg';

export const DEFAULT_SECTION_IMAGES: Record<string, string> = {
  // Row 1
  wedding_board: weddingBoardImg || '/images/wedding_board_frame_1791329701263.jpg',
  wedding_session: weddingSessionImg || '/images/wedding_session_palace_1791329710801.jpg',
  studio_photos: studioPhotosImg || '/images/studio_portrait_session_1791329721847.jpg',

  // Row 2
  photo_albums: photoAlbumsImg || '/images/luxury_photo_album_1791329731952.jpg',
  advertising: advertisingImg || '/images/banner_printing_shop_1791329744641.jpg',
  graphic_design: graphicDesignImg || '/images/branding_design_mockup_1791329754567.jpg',

  // Row 3
  passport_photos: passportPhotosImg || '/images/passport_id_photos_1791329763832.jpg',
  photo_restoration: photoRestorationImg || '/images/vintage_photo_restoration_1791329773616.jpg',
  canvas_prints: canvasPrintsImg || '/images/stretched_canvas_gallery_1791329785266.jpg',

  // Row 4
  video_montage: videoMontageImg || '/images/video_editing_suite_1791329794357.jpg',
  outdoor_photo: outdoorPhotoImg || '/images/outdoor_wedding_couple_1791329805313.jpg',
  thermal_print: thermalPrintImg || '/images/thermal_press_printing_1791329815734.jpg'
};
