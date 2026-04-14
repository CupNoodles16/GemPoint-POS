class User < ApplicationRecord
  # Include default devise modules
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :validatable,
         :trackable

  # Associations
  has_many :transactions, dependent: :nullify

  # Validations
  validates :first_name, presence: true
  validates :last_name, presence: true
  validates :role, presence: true, inclusion: { in: %w[admin cashier] }
  validates :phone, uniqueness: true, allow_blank: true

  # Scopes
  scope :active, -> { where(active: true) }
  scope :admins, -> { where(role: 'admin') }
  scope :cashiers, -> { where(role: 'cashier') }

  # Full name helper
  def full_name
    "#{first_name} #{last_name}".strip
  end

  # Role check methods
  def admin?
    role == 'admin'
  end

  def cashier?
    role == 'cashier'
  end

  # Override Devise method to check if account is active
  def active_for_authentication?
    super && active?
  end

  def inactive_message
    active? ? super : :account_inactive
  end
end