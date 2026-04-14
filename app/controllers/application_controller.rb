class ApplicationController < ActionController::Base
  def after_sign_in_path_for(resource)
    if resource.admin?
      pos_path
    else
      pos_path
    end
  end
end