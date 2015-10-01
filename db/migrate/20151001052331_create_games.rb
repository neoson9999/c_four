class CreateGames < ActiveRecord::Migration
  def change
    create_table :games do |t|
      t.integer :state
      t.integer :whose_turn

      t.timestamps null: false
    end
  end
end
