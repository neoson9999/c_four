class AddPlayersConnectedToGame < ActiveRecord::Migration
  def change
    add_column :games, :players_connected, :integer
  end
end
