class CreateDisks < ActiveRecord::Migration
  def change
    create_table :disks do |t|
      t.integer :game_id
      t.integer :row
      t.integer :column
      t.integer :player
      t.boolean :winning_disk

      t.timestamps null: false
    end
  end
end
