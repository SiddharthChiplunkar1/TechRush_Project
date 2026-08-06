import Button from "../../common/Button/Button";

const CTAButtons = () => {
  return (
    <div className="hidden lg:flex items-center gap-4">

      <Button variant="secondary">

        Login

      </Button>

      <Button>

        Register

      </Button>

    </div>
  );
};

export default CTAButtons;