class PosController < ApplicationController
  before_action :authenticate_user!
  
  def index
    @products = Product.active.order(:name) if Product.table_exists?
  end
end