import { Route, Routes } from "react-router-dom";
import Homepage from './src/pages/home_page';
import Sudokupage from './src/pages/sudoku_page';
import SudokuPlaypage from './src/pages/sudoku_play_page';
import Puzzlepage from './src/pages/puzzle_page';
import PuzzlePlaypage from './src/pages/puzzle_play_page';
import Solitairepage from './src/pages/solitaire_page';
import SolitairePlaypage from './src/pages/solitaire_play_page';
import Signuppage from './src/pages/signup_page';
import Loginpage from './src/pages/login_page';
import Aboutuspage from './src/pages/aboutus_page';
import Feedbackpage from './src/pages/feedback_page';
import Notfoundpage from './src/pages/notfound_page';

function AppRoutes() {
    return (
      <Routes>
        <Route path="/" element={<Homepage/>} />
        <Route path="/*" element={<Notfoundpage/>} />
        <Route path="/sudoku" element={<Sudokupage/>} />
        <Route path="/sudoku-play" element={<SudokuPlaypage/>} />
        <Route path="/puzzle" element={<Puzzlepage/>} />
        <Route path="/puzzle-play" element={<PuzzlePlaypage/>} />
        <Route path="/solitaire" element={<Solitairepage/>} />
        <Route path="/solitaire-play" element={<SolitairePlaypage/>} />
        <Route path="/signup" element={<Signuppage/>} />
        <Route path="/login" element={<Loginpage/>} />
        <Route path="/aboutus" element={<Aboutuspage/>} />
        <Route path="/feedback" element={<Feedbackpage/>} />
      </Routes>
    );
  };

  export default AppRoutes;