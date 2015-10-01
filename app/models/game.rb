class Game < ActiveRecord::Base
  has_many :disks

  enum state: {
    WAITING_FOR_OPPONENT: 0,
    IN_PROGRESS: 1
  }

  enum whose_turn: {
    PLAYER_ONE_TURN: 1,
    PLAYER_TWO_TURN: 2
  }
end
