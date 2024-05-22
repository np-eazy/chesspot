export const ITALIAN_OPENING = "1. e4 e5 2. Nf3 Nc6 3. Bc4 Bc5";
export const PROMOTION_TEST = "1. e4 c6 2. e5 c5 3. e6 f6 4. exd7+ Kf7 5. dxc8=R Qc7 6. Rxf8# Kxf8 7. d4 c4 8. d5 c3 9. d6 cxb2 10. d7 bxa1=R 11. d8=R+ Kf7 ";
export const EN_PASSANT_TEST = "1. e4 d5 2. e5 f5 3. exf6 e.p. c5 4. Nf3 e5 5. fxg7 Be7 6. d4 cxd4 7. Nxe5 Nf6 8. c4 dxc3 e.p. 9. bxc3 d4 10. cxd4 Ng8 11. Qa4+ Nd7 12. Qb4 Nd7f6 13. Qb6 axb6 14. Nd3 b5 15. Nf4 b4 16. Ne6 b5 17. a4 bxa4 18. Rxa4 Rxa4 19. d5 b3 ";
export const KASPAROV_V_TOPALOV = "1. e4 d6 2. d4 Nf6 3. Nc3 g6 4. Be3 Bg7 5. Qd2 c6 6. f3 b5 7. Nge2 Nbd7 8. Bh6 Bxh6 9. Qxh6 Bb7 10. a3 e5 11. O-O-O Qe7 12. Kb1 a6 13. Nc1 O-O-O 14. Nb3 exd4 15. Rxd4 c5 16. Rd1 Nb6 17. g3 Kb8 18. Na5 Ba8 19. Bh3 d5 20. Qf4+ Ka7 21. Rhe1 d4 22. Nd5 Nbxd5 23. exd5 Qd6 24. Rxd4 cxd4 25. Re7+ Kb6 26. Qxd4+ Kxa5 27. b4+ Ka4 28. Qc3 Qxd5 29. Ra7 Bb7 30. Rxb7 Qc4 31. Qxf6 Kxa3 32. Qxa6+ Kxb4 33. c3+ Kxc3 34. Qa1+ Kd2 35. Qb2+ Kd1 36. Bf1 Rd2 37. Rd7 Rxd7 38. Bxc4 bxc4 39. Qxh8 Rd3 40. Qa8 c3 41. Qa4+ Ke1 42. f4 f5 43. Kc1 Rd2 44. Qa7";
export const MORPHY_V_KARL = "1. e4 e5 2. Nf3 d6 3. d4 Bg4 4. dxe5 Bxf3 5. Qxf3 dxe5 6. Bc4 Nf6 7. Qb3 Qe7 8. Nc3 c6 9. Bg5 b5 10. Nxb5 cxb5 11. Bxb5+ Nbd7 12. O-O-O Rd8 13. Rxd7 Rxd7 14. Rd1 Qe6 15. Bxd7+ Nxd7 16. Qb8+ Nxb8 17. Rd8#"
export const KASPAROV_V_ANAND = "1. e4 d5 2. exd5 Qxd5 3. Nc3 Qa5 4. d4 Nf6 5. Nf3 c6 6. Ne5 Be6 7. Bd3 Nbd7 8. f4 g6 9. O-O Bg7 10. Kh1 Bf5 11. Bc4 e6 12. Be2 h5 13. Be3 Rd8 14. Bg1 O-O 15. Bf3 Nd5 16. Nxd5 exd5 17. Bf2 Qc7 18. Rc1 f6 19. Nd3 Rfe8 20. b3 Nb6 21. a4 Nc8 22. c4 Qf7 23. a5 Bf8 24. cxd5 cxd5 25. Bh4 Nd6 26. a6 b6 27. Ne5 Qe6 28. g4 hxg4 29. Nxg4 Bg7 30. Rc7 Ne4 31. Ne3 Bh3 32. Rg1 g5 33. Bg4 Bxg4 34. Qxg4 Qxg4 35. Rxg4 Nd6 36. Bf2 Nb5 37. Rb7 Re4 38. f5 Rxg4 39. Nxg4 Rc8 40. Rd7 Rc2 41. Rxd5";

export const BULLET_GAME_PGN = `[Event "Live Chess"]
[Site "Chess.com"]
[Date "2024.05.14"]
[Round "?"]
[White "lahcenbou"]
[Black "e4e5istaken"]
[Result "0-1"]
[ECO "B15"]
[WhiteElo "1022"]
[BlackElo "920"]
[TimeControl "60"]
[EndTime "1:24:22 PDT"]
[Termination "e4e5istaken won on time"]

1. e4 c6 2. d4 d5 3. Nc3 Nd7 4. e5 f6 5. Nf3 fxe5 6. Nxe5 Nxe5 7. dxe5 e6 8. Bf4
h6 9. Bd3 g5 10. Bg3 Ne7 11. h4 Bg7 12. hxg5 h5 13. Bh4 Nf5 14. Bxf5 exf5 15.
Qf3 Bxe5 16. O-O-O Be6 17. Rhe1 Qd6 18. Nxd5 Bxd5 19. Qxf5 Rf8 20. c4 Rxf5 21.
Rxd5 cxd5 22. cxd5 Qc5+ 23. Kb1 Rc8 24. a3 Rxf2 25. Bxf2 Qxf2 26. Rxe5+ Kd7 27.
d6 Qf1+ 28. Ka2 Qc4+ 29. Kb1 Qc1+ 30. Ka2 Rc5 31. Re7+ Kxd6 32. Rg7 Qc4+ 33. Kb1
Rb5 0-1`

export type ManualGameMove = [number, number, number, number];

export const MANUAL_GAME_MOVES = [ 
    [ [ 2, 5 ], [ 4, 5 ], 0 ], 
    // Check invalid pawn movements
    [ [ 7, 3 ], [ 6, 5 ], -1 ], 
    [ [ 7, 3 ], [ 6, 4 ], -1 ], 
    [ [ 7, 3 ], [ 6, 3 ], 0 ], 
    // Check invalid knight movements
    [ [ 1, 7 ], [ 3, 7 ], -1 ], 
    [ [ 1, 7 ], [ 4, 6 ], -1 ], 
    // Check invalid rook movements
    [ [ 1, 8 ], [ 5, 8 ], -1 ], 
    [ [ 1, 8 ], [ 8, 8 ], -1 ], 
    // Check invalid bishop movements
    [ [ 1, 6 ], [ 3, 8 ], -1 ], 
    // Check invalid queen movements
    [ [ 1, 4 ], [ 3, 2 ], -1 ], 
    [ [ 1, 4 ], [ 5, 4 ], -1 ], 
    [ [ 1, 4 ], [ 4, 7 ], 0 ], 

    [ [ 7, 5 ], [ 5, 5 ], 0 ], 
    [ [ 4, 5 ], [ 5, 6 ], -1 ], 
    [ [ 4, 5 ], [ 5, 5 ], -1 ], 
    [ [ 4, 5 ], [ 5, 4 ], -1 ], 
    [ [ 1, 6 ], [ 2, 5 ], 0 ], 
    [ [ 8, 6 ], [ 5, 3 ], 0 ], 
    [ [ 2, 5 ], [ 5, 8 ], -1 ], 
    [ [ 4, 7 ], [ 1, 4 ], -1 ], 
    [ [ 1, 7 ], [ 3, 6 ], 0 ], 
    [ [ 8, 7 ], [ 6, 6 ], 0 ], 
    [ [ 4, 7 ], [ 8, 7 ], -1 ], 
    [ [ 4, 7 ], [ 7, 7 ], 0 ], 

    // King walks into check; illegal
    [ [ 8, 5 ], [ 8, 6 ], -2 ], // Amend
    // King castles into check; illegal
    [ [ 8, 5 ], [ 8, 7 ], -1 ], // Castle Invalid
    [ [ 8, 5 ], [ 7, 5 ], 0 ], 
    [ [ 2, 7 ], [ 4, 7 ], 0 ], 
    [ [ 6, 6 ], [ 4, 7 ], 0 ], 
    [ [ 2, 3 ], [ 4, 3 ], 0 ], 
    // King is pinned
    [ [ 7, 6 ], [ 6, 6 ], -2 ], // Amend
    [ [ 7, 6 ], [ 5, 6 ], -2 ], // Amend
    
    [ [ 5, 3 ], [ 6, 2 ], 0 ], 
    [ [ 4, 3 ], [ 5, 3 ], 0 ], 
    [ [ 7, 4 ], [ 5, 4 ], 0 ], 
    // En passant on wrong square
    [ [ 4, 5 ], [ 5, 6 ], -1 ], 
    [ [ 4, 5 ], [ 5, 5 ], -1 ], 

    [ [ 1, 5 ], [ 1, 7 ], 2 ], // Castle
    [ [ 8, 2 ], [ 6, 1 ], 0 ], 

    // En passant at wrong time
    [ [ 5, 3 ], [ 6, 4 ], -1 ], 
    [ [ 5, 3 ], [ 6, 4 ], -1 ], 

    [ [ 7, 7 ], [ 6, 6 ], 0 ], 
    [ [ 7, 5 ], [ 8, 5 ], 0 ], 
    [ [ 4, 5 ], [ 5, 4 ], 0 ], 

    // King cannot castle after moving
    [ [ 8, 5 ], [ 8, 7 ], -1 ], 
    [ [ 8, 4 ], [ 6, 6 ], 0 ], 
    [ [ 3, 6 ], [ 5, 5 ], 0 ], 
    [ [ 6, 6 ], [ 6, 7 ], 0 ], 
    [ [ 2, 4 ], [ 3, 4 ], 0 ], 
    [ [ 4, 7 ], [ 3, 5 ], 0 ], 
    [ [ 1, 7 ], [ 1, 8 ], 0 ] 
]