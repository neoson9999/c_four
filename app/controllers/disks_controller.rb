class DisksController < ApplicationController
  before_action :set_disk, only: [:show]

  def show
    respond_to do |format|
      if @disk.present?
        format.json { render json: @disk.to_json }
      else
        #TODO
      end
    end
  end

  private

  def set_disk
    @disk = Disk.find(params[:id])
  end
end
