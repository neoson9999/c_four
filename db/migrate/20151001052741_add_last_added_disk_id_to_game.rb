class AddLastAddedDiskIdToGame < ActiveRecord::Migration
  def change
    add_column :games, :last_added_disk_id, :integer
  end
end
