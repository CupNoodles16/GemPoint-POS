require "test_helper"

class LandingboardControllerTest < ActionDispatch::IntegrationTest
  test "should get index" do
    get landingboard_index_url
    assert_response :success
  end
end
