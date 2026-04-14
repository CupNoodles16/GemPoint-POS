Rails.application.routes.draw do
  # Authentication
  devise_for :users
  
  # Health check
  get "up" => "rails/health#show", as: :rails_health_check

  # Root path - Splash screen with logo
  root "welcome#index"
  
  # Main POS interface (landing after login)
  get "pos", to: "pos#index"
end