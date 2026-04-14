class Category < ApplicationRecord
  # Associations
  has_many :products, dependent: :nullify
  
  # Validations
  validates :name, presence: true, uniqueness: true
  
  # Scopes - use 'its_active' instead of 'active'
  scope :active, -> { where(its_active: true) }
  
  # Instance methods
  def to_s
    name
  end
end