class GamesController < ApplicationController
  skip_before_filter :verify_authenticity_token
  before_action :set_game, only: [:show, :edit, :update, :destroy, :join_game, :next_player_turn, :add_disk_to_game]

  def play_game
    respond_to do |format|
      format.html { render :game_page }
    end
  end

  def join_game
    respond_to do |format|
      if @game.present?
        if @game.players_connected == 1
          @game.players_connected += 1
          @game.state = Game.states[:IN_PROGRESS]
          @game.save!
          format.json { render json: @game.to_json }
        end
      else
        # TODO
      end
    end
  end

  def next_player_turn
    respond_to do |format|
      if @game.present?
        if @game.PLAYER_ONE_TURN?
          @game.update_attribute(:whose_turn, Game.whose_turns[:PLAYER_TWO_TURN])
        else
          @game.update_attribute(:whose_turn, Game.whose_turns[:PLAYER_ONE_TURN])
        end
        format.json { render json: @game.to_json }
      else
        # TODO
      end
    end
  end

  def add_disk_to_game
    permitted_disk_params = disk_params
    @disk = Disk.new(permitted_disk_params)

    respond_to do |format|
      if @game.present?
        if @disk.save!
          @game.update_attribute(:last_added_disk_id, @disk.id)
          format.json { render json: @disk.to_json }
        else
        end
      else
        #TODO
      end
    end
  end

  def index
    @games = Game.all
  end

  def show
    respond_to do |format|
      format.json { render json: @game.to_json }
    end
  end

  def new
    @game = Game.new
  end

  def edit
  end

  def create
    permitted_params = game_params
    permitted_params[:state] = permitted_params[:state].to_i
    permitted_params[:whose_turn] = permitted_params[:whose_turn].to_i
    @game = Game.new(permitted_params)

    respond_to do |format|
      if @game.save
        format.html { render :show, status: :created, location: @game }
        format.json { render json: @game.to_json }
      else
        format.json { render json: @game.to_json, status: :unprocessable_entity }
      end
    end
  end

  # PATCH/PUT /users/1
  # PATCH/PUT /users/1.json
  def update
    respond_to do |format|
      if @user.update(user_params)
        format.html { redirect_to @user, notice: 'User was successfully updated.' }
        format.json { render :show, status: :ok, location: @user }
      else
        format.html { render :edit }
        format.json { render json: @user.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /users/1
  # DELETE /users/1.json
  def destroy
    @user.destroy
    respond_to do |format|
      format.html { redirect_to users_url, notice: 'User was successfully destroyed.' }
      format.json { head :no_content }
    end
  end

  private

  def set_game
    @game = Game.find(params[:id])
  end

  def game_params
    params.require(:game).permit(:state, :whose_turn, :last_added_disk_id, :players_connected)
  end

  def disk_params
    params.require(:disk).permit(:game_id, :row, :column, :player, :winning_disk)
  end
end
